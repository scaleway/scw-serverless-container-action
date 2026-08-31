import * as core from '@actions/core'
import { Client } from '@scaleway/sdk-client'
import { Containerv1 } from '@scaleway/sdk-container'
import { ENV, DEFAULTS, CLEANUP_DATE_FIELDS } from './constants'
import {
  deployContainer,
  getContainersNamespace,
  waitForNamespaceReady,
  setCustomDomainContainer,
  getContainer,
  deleteContainer,
  listContainersByNamespace,
} from './container'
import { setDnsRecord, deleteDnsRecord } from './dns'
import { getContainerName } from './utils'

export async function setupDomain(
  client: Client,
  container: Containerv1.Container,
): Promise<Containerv1.Domain | null> {
  const dnsName = process.env[ENV.DNS]

  if (!dnsName) {
    return null
  }

  try {
    const hostname = await setDnsRecord(client, container, dnsName)

    const containerDomain = await setCustomDomainContainer(client, container, hostname)

    core.info(`ContainerDomain: ${containerDomain.hostname} ${containerDomain.status}`)

    return containerDomain
  } catch (error) {
    core.warning(`Unable to setup domain: ${error}`)
    return null
  }
}

export async function deploy(
  client: Client,
  region: string,
  pathRegistry: string,
): Promise<{ container: Containerv1.Container; domain: Containerv1.Domain | null }> {
  const namespace = await getContainersNamespace(client, region)

  await waitForNamespaceReady(client, namespace)

  const containerName = getContainerName(pathRegistry)

  const container = await deployContainer(client, namespace, containerName, pathRegistry)

  const domain = await setupDomain(client, container)

  return { container, domain }
}

export async function teardown(client: Client, region: string, pathRegistry: string): Promise<Containerv1.Container> {
  const containerName = getContainerName(pathRegistry)
  const container = await getContainer(client, region, containerName)

  if (!container) {
    throw new Error(`Container ${containerName} not found`)
  }

  const dnsName = process.env[ENV.DNS]

  if (dnsName) {
    try {
      await deleteDnsRecord(client, container, dnsName)
    } catch (error) {
      core.warning(`Unable to remove DNS record: ${error}`)
    }
  }

  const deletedContainer = await deleteContainer(client, region, container)

  core.info(`Container ${deletedContainer.name} deleted`)

  return deletedContainer
}

export type CleanupResult = {
  totalCount: number
  deletedCount: number
  dryRun: boolean
  deletedContainers: Containerv1.Container[]
}

function getCleanupOptions() {
  const maxAgeDays = parseInt(process.env[ENV.CLEANUP_MAX_AGE_DAYS] || DEFAULTS.CLEANUP_MAX_AGE_DAYS.toString(), 10)
  const dateField = process.env[ENV.CLEANUP_DATE_FIELD] || DEFAULTS.CLEANUP_DATE_FIELD
  const namePattern = process.env[ENV.CLEANUP_NAME_PATTERN] || ''
  const dryRun = (process.env[ENV.CLEANUP_DRY_RUN] || DEFAULTS.CLEANUP_DRY_RUN.toString()) === 'true'

  return { maxAgeDays, dateField, namePattern, dryRun }
}

function filterStaleContainers(
  containers: Containerv1.Container[],
  options: { maxAgeDays: number; dateField: string; namePattern: string },
): Containerv1.Container[] {
  const { maxAgeDays, dateField, namePattern } = options

  let regex: RegExp | null = null

  if (namePattern) {
    try {
      regex = new RegExp(namePattern)
    } catch (error) {
      throw new Error(`Invalid cleanup_name_pattern: ${error}`)
    }
  }

  if (dateField !== CLEANUP_DATE_FIELDS.CREATED_AT && dateField !== CLEANUP_DATE_FIELDS.UPDATED_AT) {
    throw new Error(`Invalid cleanup_date_field: ${dateField}. Valid values: created_at, updated_at`)
  }

  const now = Date.now()
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000

  return containers.filter(container => {
    if (regex && !regex.test(container.name)) {
      return false
    }

    if (maxAgeDays > 0) {
      const dateValue = dateField === CLEANUP_DATE_FIELDS.CREATED_AT ? container.createdAt : container.updatedAt

      if (!dateValue) {
        core.warning(`Container ${container.name} has no ${dateField}, skipping`)
        return false
      }

      const ageMs = now - dateValue.getTime()

      if (ageMs < maxAgeMs) {
        return false
      }
    }

    return true
  })
}

export async function cleanup(client: Client, region: string): Promise<CleanupResult> {
  const options = getCleanupOptions()

  core.info(
    `Cleanup config: max_age_days=${options.maxAgeDays}, date_field=${options.dateField}, ` +
      `name_pattern=${options.namePattern || '(none)'}, dry_run=${options.dryRun}`,
  )

  const allContainers = await listContainersByNamespace(client, region)

  core.info(`Found ${allContainers.length} container(s) in namespace`)

  const staleContainers = filterStaleContainers(allContainers, options)

  core.info(`${staleContainers.length} container(s) match the cleanup filters`)

  const deletedContainers: Containerv1.Container[] = []

  for (const container of staleContainers) {
    const dateValue = options.dateField === CLEANUP_DATE_FIELDS.CREATED_AT ? container.createdAt : container.updatedAt

    core.info(
      `Container ${container.name} (id: ${container.id}) - ${options.dateField}: ${dateValue?.toISOString() ?? 'unknown'}`,
    )

    if (options.dryRun) {
      core.info(`[dry-run] Would delete container ${container.name}`)
      deletedContainers.push(container)
      continue
    }

    try {
      const deleted = await deleteContainer(client, region, container)
      core.info(`Container ${deleted.name} deleted`)
      deletedContainers.push(deleted)
    } catch (error) {
      core.warning(`Failed to delete container ${container.name}: ${error}`)
    }
  }

  return {
    totalCount: allContainers.length,
    deletedCount: deletedContainers.length,
    dryRun: options.dryRun,
    deletedContainers,
  }
}

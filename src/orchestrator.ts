import * as core from '@actions/core'
import { Client } from '@scaleway/sdk-client'
import { Containerv1beta1 } from '@scaleway/sdk-container'
import { ENV } from './constants'
import {
  deployContainer,
  getContainersNamespace,
  waitForNamespaceReady,
  setCustomDomainContainer,
  getContainer,
  deleteContainer,
} from './container'
import { setDnsRecord, deleteDnsRecord } from './dns'
import { getContainerName } from './utils'

export async function setupDomain(
  client: Client,
  container: Containerv1beta1.Container,
): Promise<Containerv1beta1.Domain | null> {
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
): Promise<{ container: Containerv1beta1.Container; domain: Containerv1beta1.Domain | null }> {
  const namespace = await getContainersNamespace(client, region)

  await waitForNamespaceReady(client, namespace)

  const containerName = getContainerName(pathRegistry)

  const container = await deployContainer(client, namespace, containerName, pathRegistry)

  const domain = await setupDomain(client, container)

  return { container, domain }
}

export async function teardown(client: Client, region: string, pathRegistry: string): Promise<Containerv1beta1.Container> {
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

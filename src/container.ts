import * as core from '@actions/core'
import { Client } from '@scaleway/sdk-client'
import { Containerv1 } from '@scaleway/sdk-container'
import { ENV, DEFAULTS } from './constants'
import { envToInt, envOr, parseKeyValue } from './utils'

export type ContainerEnv = {
  port: number
  memoryLimit: number
  minScale: number
  maxScale: number
  maxConcurrency: number
  cpuLimit: number
  sandbox: Containerv1.ContainerSandbox
}

export function getContainerDomain(container: Containerv1.Container): string {
  return container.publicEndpoint.replace(/^https?:\/\//, '').split('/')[0]
}

export function getSandboxVersion(): Containerv1.ContainerSandbox {
  const sandbox = envOr(ENV.SANDBOX, DEFAULTS.SANDBOX)

  if (sandbox === 'v1') {
    return 'v1' as const
  }

  if (sandbox === 'v2') {
    return 'v2' as const
  }

  return 'unknown_sandbox'
}

export function getContainerEnvVariables(): ContainerEnv {
  return {
    port: envToInt(ENV.CONTAINER_PORT, DEFAULTS.PORT),
    memoryLimit: envToInt(ENV.MEMORY_LIMIT, DEFAULTS.MEMORY_LIMIT),
    minScale: envToInt(ENV.MIN_SCALE, DEFAULTS.MIN_SCALE),
    maxScale: envToInt(ENV.MAX_SCALE, DEFAULTS.MAX_SCALE),
    maxConcurrency: envToInt(ENV.MAX_CONCURRENCY, DEFAULTS.MAX_CONCURRENCY),
    cpuLimit: envToInt(ENV.CPU_LIMIT, DEFAULTS.CPU_LIMIT),
    sandbox: getSandboxVersion(),
  }
}

export async function waitForNamespaceReady(
  client: Client,
  namespace: Containerv1.Namespace,
): Promise<Containerv1.Namespace> {
  core.info('Waiting for namespace to be ready...')

  const api = new Containerv1.API(client)

  const readyNamespace = await api.waitForNamespace({
    region: namespace.region,
    namespaceId: namespace.id,
  })

  return readyNamespace
}

export async function waitForContainerReady(
  client: Client,
  container: Containerv1.Container,
): Promise<Containerv1.Container> {
  core.info('Waiting for container to be ready...')

  const api = new Containerv1.API(client)

  const readyContainer = await api.waitForContainer({
    region: container.region,
    containerId: container.id,
  })

  return readyContainer
}

export async function getContainer(
  client: Client,
  region: string,
  containerName: string,
): Promise<Containerv1.Container | null> {
  const namespaceId = process.env[ENV.CONTAINER_NAMESPACE_ID]

  if (!namespaceId) {
    throw new Error('Namespace ID not found')
  }

  const api = new Containerv1.API(client)

  const response = await api.listContainers({
    region,
    namespaceId,
    name: containerName,
  })

  if (response.containers.length === 0) {
    return null
  }

  return response.containers[0]
}

export async function listContainersByNamespace(client: Client, region: string): Promise<Containerv1.Container[]> {
  const namespaceId = process.env[ENV.CONTAINER_NAMESPACE_ID]

  if (!namespaceId) {
    throw new Error('Namespace ID not found')
  }
  const api = new Containerv1.API(client)
  const containers = await api
    .listContainers({
      region,
      namespaceId,
    })
    .all()

  return containers
}

export async function deleteContainer(
  client: Client,
  region: string,
  container: Containerv1.Container,
): Promise<Containerv1.Container> {
  const api = new Containerv1.API(client)

  const deletedContainer = await api.deleteContainer({
    region,
    containerId: container.id,
  })

  return deletedContainer
}

export async function getContainersNamespace(client: Client, region: string): Promise<Containerv1.Namespace> {
  const namespaceId = process.env[ENV.CONTAINER_NAMESPACE_ID]

  if (!namespaceId) {
    throw new Error('Containers namespace ID not found')
  }

  const api = new Containerv1.API(client)

  const namespace = await api.getNamespace({
    region,
    namespaceId,
  })

  return namespace
}

export async function isContainerAlreadyCreated(
  client: Client,
  namespace: Containerv1.Namespace,
  containerName: string,
): Promise<Containerv1.Container | null> {
  const api = new Containerv1.API(client)

  const response = await api.listContainers({
    region: namespace.region,
    namespaceId: namespace.id,
    name: containerName,
  })

  if (response.containers.length === 0) {
    return null
  }

  return response.containers[0]
}

export async function updateDeployedContainer(
  client: Client,
  container: Containerv1.Container,
  pathRegistry: string,
): Promise<Containerv1.Container> {
  const api = new Containerv1.API(client)

  await waitForContainerReady(client, container)

  const containerEnv = getContainerEnvVariables()
  const secrets = parseKeyValue(ENV.SECRETS)
  const environmentVariables = parseKeyValue(process.env[ENV.ENVIRONMENT_VARIABLES] || '')

  const updatedContainer = await api.updateContainer({
    region: container.region,
    containerId: container.id,
    image: pathRegistry,
    environmentVariables,
    secretEnvironmentVariables: secrets,
    memoryLimitBytes: containerEnv.memoryLimit * 1024 * 1024,
    minScale: containerEnv.minScale,
    maxScale: containerEnv.maxScale,
    mvcpuLimit: containerEnv.cpuLimit,
    port: containerEnv.port,
    scalingOption: { concurrentRequestsThreshold: containerEnv.maxConcurrency },
    sandbox: containerEnv.sandbox,
  })

  const readyUpdatedContainer = await waitForContainerReady(client, updatedContainer)

  const deployedContainer = await api.redeployContainer({
    region: container.region,
    containerId: readyUpdatedContainer.id,
  })

  return deployedContainer
}

export async function createContainerAndDeploy(
  client: Client,
  namespace: Containerv1.Namespace,
  pathRegistry: string,
  containerName: string,
): Promise<Containerv1.Container> {
  const api = new Containerv1.API(client)

  const containerEnv = getContainerEnvVariables()
  const secrets = parseKeyValue(ENV.SECRETS)
  const environmentVariables = parseKeyValue(process.env[ENV.ENVIRONMENT_VARIABLES] || '')

  const createdContainer = await api.createContainer({
    description: DEFAULTS.DESCRIPTION,
    name: containerName,
    namespaceId: namespace.id,
    region: namespace.region,
    image: pathRegistry,
    timeout: `${DEFAULTS.TIMEOUT_SECONDS}s`,
    environmentVariables,
    secretEnvironmentVariables: secrets,
    memoryLimitBytes: containerEnv.memoryLimit * 1024 * 1024,
    minScale: containerEnv.minScale,
    maxScale: containerEnv.maxScale,
    mvcpuLimit: containerEnv.cpuLimit,
    port: containerEnv.port,
    scalingOption: { concurrentRequestsThreshold: containerEnv.maxConcurrency },
    sandbox: containerEnv.sandbox,
  })

  const readyContainer = await waitForContainerReady(client, createdContainer)

  const deployedContainer = await api.redeployContainer({
    region: namespace.region,
    containerId: readyContainer.id,
  })

  return deployedContainer
}

export async function deployContainer(
  client: Client,
  namespace: Containerv1.Namespace,
  containerName: string,
  pathRegistry: string,
): Promise<Containerv1.Container> {
  core.info(`Container Name: ${containerName}`)

  const existingContainer = await isContainerAlreadyCreated(client, namespace, containerName)

  if (existingContainer) {
    core.info('Container already exists and will be updated')

    const updatedContainer = await updateDeployedContainer(client, existingContainer, pathRegistry)
    const readyContainer = await waitForContainerReady(client, updatedContainer)

    return readyContainer
  } else {
    const newContainer = await createContainerAndDeploy(client, namespace, pathRegistry, containerName)
    const readyContainer = await waitForContainerReady(client, newContainer)

    return readyContainer
  }
}

export async function setCustomDomainContainer(
  client: Client,
  container: Containerv1.Container,
  hostname: string,
): Promise<Containerv1.Domain> {
  if (!hostname) {
    throw new Error('Hostname is required')
  }

  if (hostname.length > 63) {
    throw new Error('Hostname cannot be longer than 63 characters')
  }

  const api = new Containerv1.API(client)

  const listResponse = await api.listDomains({
    region: container.region,
    containerId: container.id,
  })

  for (const domain of listResponse.domains) {
    if (domain.hostname === hostname) {
      return domain
    }
  }

  const createdDomain = await api.createDomain({
    region: container.region,
    containerId: container.id,
    hostname,
  })

  return createdDomain
}

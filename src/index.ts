import * as core from '@actions/core'
import { createClient } from '@scaleway/sdk-client'
import { ENV, DEFAULTS, TYPES } from './constants'
import { getContainerDomain } from './container'
import { deploy, teardown, cleanup } from './orchestrator'
import { envOr, hostnameToUrl, printOutputs } from './utils'

function createClientWrapper() {
  const accessKey = process.env[ENV.ACCESS_KEY]
  const secretKey = process.env[ENV.SECRET_KEY]

  if (!accessKey || !secretKey) {
    throw new Error('SCW_ACCESS_KEY and SCW_SECRET_KEY are required')
  }

  const client = createClient({
    accessKey,
    secretKey,
  })

  return client
}

async function run(): Promise<void> {
  try {
    const pathRegistry = process.env[ENV.REGISTRY]
    const region = envOr(ENV.REGION, DEFAULTS.REGION)
    const type = envOr(ENV.TYPE, DEFAULTS.TYPE)

    const client = createClientWrapper()

    if (type === TYPES.DEPLOY) {
      if (!pathRegistry) {
        core.setFailed('SCW_REGISTRY is not set')
        return
      }

      const { domain, container } = await deploy(client, region, pathRegistry)

      printOutputs({
        containerUrl: getContainerDomain(container),
        url: hostnameToUrl(domain?.hostname) || container.publicEndpoint,
        containerId: container.id,
        namespaceId: container.namespaceId,
      })
    } else if (type === TYPES.TEARDOWN) {
      if (!pathRegistry) {
        core.setFailed('SCW_REGISTRY is not set')
        return
      }

      const deletedContainer = await teardown(client, region, pathRegistry)

      printOutputs({
        containerUrl: getContainerDomain(deletedContainer),
        url: deletedContainer.publicEndpoint,
        containerId: deletedContainer.id,
        namespaceId: deletedContainer.namespaceId,
      })
    } else if (type === TYPES.CLEANUP) {
      const result = await cleanup(client, region)

      core.info(
        `Cleanup complete: ${result.deletedCount} container(s) ${result.dryRun ? 'would be' : ''} deleted ` +
          `out of ${result.totalCount} total`,
      )

    } else {
      core.setFailed(`Unknown type: ${type}. Valid types are: deploy, teardown, cleanup`)
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : 'An unknown error occurred')
  }
}

run()

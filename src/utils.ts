import * as core from '@actions/core'
import { CONTAINER_NAME_MAX_LENGTH, ENV } from './constants'

export function envOr(name: string, defaultValue: string): string {
  const value = process.env[name]
  return value !== undefined ? value : defaultValue
}

export function envToInt(name: string, defaultValue: number): number {
  const value = envOr(name, defaultValue.toString())
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

export function setOutput({ name, value }: { name: string; value: string }): void {
  core.setOutput(name, value)
}

export function printOutputs({
  containerUrl,
  url,
  containerId,
  namespaceId,
}: {
  containerUrl: string
  url: string
  containerId: string
  namespaceId: string
}): void {
  setOutput({ name: 'url', value: url })
  setOutput({ name: 'container_url', value: containerUrl })
  setOutput({ name: 'scw_container_id', value: containerId })
  setOutput({ name: 'scw_namespace_id', value: namespaceId })
}

export function getContainerName(pathRegistry: string): string {
  const splitPath = pathRegistry.split(':')
  let name = splitPath[1] || ''

  name = name.replace(/-/g, '')
  name = name.replace(/_/g, '')

  if (name.length > CONTAINER_NAME_MAX_LENGTH) {
    name = name.substring(0, CONTAINER_NAME_MAX_LENGTH)
  }

  return name
}

export function hostnameToUrl(hostname?: string | null): string | null {
  if (!hostname) {
    return null
  }

  return `https://${hostname}`
}

export function parseKeyValue(key: string): Record<string, string> {
  const keyValue: Record<string, string> = {}
  const envValue = process.env[key] || ''

  if (!envValue) {
    return keyValue
  }

  const pairs = envValue.split(',')

  for (const pair of pairs) {
    const splitEnv = pair.split('=')

    if (splitEnv.length === 2) {
      keyValue[splitEnv[0]] = splitEnv[1]
    }
  }

  return keyValue
}

export function parseSecrets(): Array<{ key: string; value: string }> {
  const secretsMap = parseKeyValue(ENV.SECRETS)
  const secrets: Array<{ key: string; value: string }> = []

  for (const [key, value] of Object.entries(secretsMap)) {
    secrets.push({ key, value })
  }

  return secrets
}

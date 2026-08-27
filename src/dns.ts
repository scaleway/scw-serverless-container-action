import * as core from '@actions/core'
import { Client } from '@scaleway/sdk-client'
import { Containerv1beta1 } from '@scaleway/sdk-container'
import { Domainv2beta1 } from '@scaleway/sdk-domain'
import { ENV, DNS } from './constants'

export async function deleteDnsRecord(
  client: Client,
  container: Containerv1beta1.Container,
  dnsZone: string,
): Promise<Domainv2beta1.UpdateDNSZoneRecordsResponse> {
  core.info('Update Zone DNS - Delete')

  const prefix = process.env[ENV.DNS_PREFIX] || ''
  const rootZone = process.env[ENV.ROOT_ZONE] || 'false'

  const api = new Domainv2beta1.API(client)

  const data = `${container.domainName}.`

  let name = container.name
  let type: Domainv2beta1.DomainRecordType = DNS.CNAME

  if (prefix) {
    name = prefix
    core.info(`Update With Prefix Zone DNS - Delete: ${prefix}`)
  }

  if (rootZone === 'true') {
    name = ''
    type = DNS.ALIAS
    core.info('Update Root Zone DNS - Delete')
  }

  const changes: Domainv2beta1.RecordChange[] = [
    {
      delete: {
        idFields: {
          name,
          data,
          type,
          ttl: DNS.TTL,
        },
      },
    },
  ]

  const response = await api.updateDNSZoneRecords({
    dnsZone,
    changes,
    disallowNewZoneCreation: true,
  })

  return response
}

export async function setDnsRecord(client: Client, container: Containerv1beta1.Container, dnsZone: string): Promise<string> {
  const prefix = process.env[ENV.DNS_PREFIX] || ''
  const rootZone = process.env[ENV.ROOT_ZONE] || 'false'

  core.info('Update Zone DNS - Add')

  const api = new Domainv2beta1.API(client)

  let name = container.name
  let type: Domainv2beta1.DomainRecordType = DNS.CNAME

  if (prefix) {
    name = prefix
    core.info(`Update With Prefix Zone DNS - Add: ${prefix}`)
  }

  let hostname = `${name}.${dnsZone}`

  if (rootZone === 'true') {
    name = ''
    type = DNS.ALIAS
    hostname = dnsZone
    core.info('Update Root Zone DNS - Add')
  }

  const records = [
    {
      id: '',
      name,
      type,
      ttl: DNS.TTL,
      data: `${container.domainName}.`,
      priority: 0,
    },
  ] satisfies Domainv2beta1.DomainRecord[]

  const data = `${container.domainName}.`

  const changes = [
    {
      set: {
        idFields: {
          name,
          type,
          ttl: DNS.TTL,
          data,
        },
        records,
      },
    },
  ] satisfies Domainv2beta1.RecordChange[]

  await api.updateDNSZoneRecords({
    dnsZone,
    changes,
    disallowNewZoneCreation: true,
  })

  core.info(`Hostname: ${hostname}`)

  return hostname
}

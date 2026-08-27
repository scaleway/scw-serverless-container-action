import { info } from "./node_modules/.pnpm/@actions_core@3.0.1/node_modules/@actions/core/lib/core.mjs";
import { DNS, ENV } from "./constants.mjs";
import { getContainerDomain } from "./container.mjs";
import { index_gen_exports } from "./node_modules/.pnpm/@scaleway_sdk-domain@2.10.0_@scaleway_sdk-client@2.6.0/node_modules/@scaleway/sdk-domain/dist/v2beta1/index.gen.mjs";
import "./node_modules/.pnpm/@scaleway_sdk-domain@2.10.0_@scaleway_sdk-client@2.6.0/node_modules/@scaleway/sdk-domain/dist/index.gen.mjs";

//#region src/dns.ts
async function deleteDnsRecord(client, container, dnsZone) {
	info("Update Zone DNS - Delete");
	const prefix = process.env[ENV.DNS_PREFIX] || "";
	const rootZone = process.env[ENV.ROOT_ZONE] || "false";
	const api = new index_gen_exports.API(client);
	const data = `${getContainerDomain(container)}.`;
	let name = container.name;
	let type = DNS.CNAME;
	if (prefix) {
		name = prefix;
		info(`Update With Prefix Zone DNS - Delete: ${prefix}`);
	}
	if (rootZone === "true") {
		name = "";
		type = DNS.ALIAS;
		info("Update Root Zone DNS - Delete");
	}
	const changes = [{ delete: { idFields: {
		name,
		data,
		type,
		ttl: DNS.TTL
	} } }];
	return await api.updateDNSZoneRecords({
		dnsZone,
		changes,
		disallowNewZoneCreation: true
	});
}
async function setDnsRecord(client, container, dnsZone) {
	const prefix = process.env[ENV.DNS_PREFIX] || "";
	const rootZone = process.env[ENV.ROOT_ZONE] || "false";
	info("Update Zone DNS - Add");
	const api = new index_gen_exports.API(client);
	let name = container.name;
	let type = DNS.CNAME;
	if (prefix) {
		name = prefix;
		info(`Update With Prefix Zone DNS - Add: ${prefix}`);
	}
	let hostname = `${name}.${dnsZone}`;
	if (rootZone === "true") {
		name = "";
		type = DNS.ALIAS;
		hostname = dnsZone;
		info("Update Root Zone DNS - Add");
	}
	const records = [{
		id: "",
		name,
		type,
		ttl: DNS.TTL,
		data: `${getContainerDomain(container)}.`,
		priority: 0
	}];
	const data = `${getContainerDomain(container)}.`;
	const changes = [{ set: {
		idFields: {
			name,
			type,
			ttl: DNS.TTL,
			data
		},
		records
	} }];
	await api.updateDNSZoneRecords({
		dnsZone,
		changes,
		disallowNewZoneCreation: true
	});
	info(`Hostname: ${hostname}`);
	return hostname;
}

//#endregion
export { deleteDnsRecord, setDnsRecord };
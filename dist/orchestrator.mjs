import { info, warning } from "./node_modules/.pnpm/@actions_core@3.0.1/node_modules/@actions/core/lib/core.mjs";
import { ENV } from "./constants.mjs";
import { getContainerName } from "./utils.mjs";
import { deleteContainer, deployContainer, getContainer, getContainersNamespace, setCustomDomainContainer, waitForNamespaceReady } from "./container.mjs";
import { deleteDnsRecord, setDnsRecord } from "./dns.mjs";

//#region src/orchestrator.ts
async function setupDomain(client, container) {
	const dnsName = process.env[ENV.DNS];
	if (!dnsName) return null;
	try {
		const hostname = await setDnsRecord(client, container, dnsName);
		const containerDomain = await setCustomDomainContainer(client, container, hostname);
		info(`ContainerDomain: ${containerDomain.hostname} ${containerDomain.status}`);
		return containerDomain;
	} catch (error) {
		warning(`Unable to setup domain: ${error}`);
		return null;
	}
}
async function deploy(client, region, pathRegistry) {
	const namespace = await getContainersNamespace(client, region);
	await waitForNamespaceReady(client, namespace);
	const containerName = getContainerName(pathRegistry);
	const container = await deployContainer(client, namespace, containerName, pathRegistry);
	return {
		container,
		domain: await setupDomain(client, container)
	};
}
async function teardown(client, region, pathRegistry) {
	const containerName = getContainerName(pathRegistry);
	const container = await getContainer(client, region, containerName);
	if (!container) throw new Error(`Container ${containerName} not found`);
	const dnsName = process.env[ENV.DNS];
	if (dnsName) try {
		await deleteDnsRecord(client, container, dnsName);
	} catch (error) {
		warning(`Unable to remove DNS record: ${error}`);
	}
	const deletedContainer = await deleteContainer(client, region, container);
	info(`Container ${deletedContainer.name} deleted`);
	return deletedContainer;
}

//#endregion
export { deploy, setupDomain, teardown };
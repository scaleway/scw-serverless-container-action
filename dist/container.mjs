import { info } from "./node_modules/.pnpm/@actions_core@3.0.1/node_modules/@actions/core/lib/core.mjs";
import { DEFAULTS, ENV } from "./constants.mjs";
import { index_gen_exports } from "./node_modules/.pnpm/@scaleway_sdk-container@2.12.0_@scaleway_sdk-client@2.6.0/node_modules/@scaleway/sdk-container/dist/v1/index.gen.mjs";
import "./node_modules/.pnpm/@scaleway_sdk-container@2.12.0_@scaleway_sdk-client@2.6.0/node_modules/@scaleway/sdk-container/dist/index.gen.mjs";
import { envOr, envToInt, parseKeyValue } from "./utils.mjs";

//#region src/container.ts
function getContainerDomain(container) {
	return container.publicEndpoint.replace(/^https?:\/\//, "").split("/")[0];
}
function getSandboxVersion() {
	const sandbox = envOr(ENV.SANDBOX, DEFAULTS.SANDBOX);
	if (sandbox === "v1") return "v1";
	if (sandbox === "v2") return "v2";
	return "unknown_sandbox";
}
function getContainerEnvVariables() {
	return {
		port: envToInt(ENV.CONTAINER_PORT, DEFAULTS.PORT),
		memoryLimit: envToInt(ENV.MEMORY_LIMIT, DEFAULTS.MEMORY_LIMIT),
		minScale: envToInt(ENV.MIN_SCALE, DEFAULTS.MIN_SCALE),
		maxScale: envToInt(ENV.MAX_SCALE, DEFAULTS.MAX_SCALE),
		maxConcurrency: envToInt(ENV.MAX_CONCURRENCY, DEFAULTS.MAX_CONCURRENCY),
		cpuLimit: envToInt(ENV.CPU_LIMIT, DEFAULTS.CPU_LIMIT),
		sandbox: getSandboxVersion()
	};
}
async function waitForNamespaceReady(client, namespace) {
	info("Waiting for namespace to be ready...");
	return await new index_gen_exports.API(client).waitForNamespace({
		region: namespace.region,
		namespaceId: namespace.id
	});
}
async function waitForContainerReady(client, container) {
	info("Waiting for container to be ready...");
	return await new index_gen_exports.API(client).waitForContainer({
		region: container.region,
		containerId: container.id
	});
}
async function getContainer(client, region, containerName) {
	const namespaceId = process.env[ENV.CONTAINER_NAMESPACE_ID];
	if (!namespaceId) throw new Error("Namespace ID not found");
	const response = await new index_gen_exports.API(client).listContainers({
		region,
		namespaceId,
		name: containerName
	});
	if (response.containers.length === 0) return null;
	return response.containers[0];
}
async function deleteContainer(client, region, container) {
	return await new index_gen_exports.API(client).deleteContainer({
		region,
		containerId: container.id
	});
}
async function getContainersNamespace(client, region) {
	const namespaceId = process.env[ENV.CONTAINER_NAMESPACE_ID];
	if (!namespaceId) throw new Error("Containers namespace ID not found");
	return await new index_gen_exports.API(client).getNamespace({
		region,
		namespaceId
	});
}
async function isContainerAlreadyCreated(client, namespace, containerName) {
	const response = await new index_gen_exports.API(client).listContainers({
		region: namespace.region,
		namespaceId: namespace.id,
		name: containerName
	});
	if (response.containers.length === 0) return null;
	return response.containers[0];
}
async function updateDeployedContainer(client, container, pathRegistry) {
	const api = new index_gen_exports.API(client);
	await waitForContainerReady(client, container);
	const containerEnv = getContainerEnvVariables();
	const secrets = parseKeyValue(ENV.SECRETS);
	const environmentVariables = parseKeyValue(process.env[ENV.ENVIRONMENT_VARIABLES] || "");
	const readyUpdatedContainer = await waitForContainerReady(client, await api.updateContainer({
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
		sandbox: containerEnv.sandbox
	}));
	return await api.redeployContainer({
		region: container.region,
		containerId: readyUpdatedContainer.id
	});
}
async function createContainerAndDeploy(client, namespace, pathRegistry, containerName) {
	const api = new index_gen_exports.API(client);
	const containerEnv = getContainerEnvVariables();
	const secrets = parseKeyValue(ENV.SECRETS);
	const environmentVariables = parseKeyValue(process.env[ENV.ENVIRONMENT_VARIABLES] || "");
	const readyContainer = await waitForContainerReady(client, await api.createContainer({
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
		sandbox: containerEnv.sandbox
	}));
	return await api.redeployContainer({
		region: namespace.region,
		containerId: readyContainer.id
	});
}
async function deployContainer(client, namespace, containerName, pathRegistry) {
	info(`Container Name: ${containerName}`);
	const existingContainer = await isContainerAlreadyCreated(client, namespace, containerName);
	if (existingContainer) {
		info("Container already exists and will be updated");
		return await waitForContainerReady(client, await updateDeployedContainer(client, existingContainer, pathRegistry));
	} else return await waitForContainerReady(client, await createContainerAndDeploy(client, namespace, pathRegistry, containerName));
}
async function setCustomDomainContainer(client, container, hostname) {
	if (!hostname) throw new Error("Hostname is required");
	if (hostname.length > 63) throw new Error("Hostname cannot be longer than 63 characters");
	const api = new index_gen_exports.API(client);
	const listResponse = await api.listDomains({
		region: container.region,
		containerId: container.id
	});
	for (const domain of listResponse.domains) if (domain.hostname === hostname) return domain;
	return await api.createDomain({
		region: container.region,
		containerId: container.id,
		hostname
	});
}

//#endregion
export { createContainerAndDeploy, deleteContainer, deployContainer, getContainer, getContainerDomain, getContainerEnvVariables, getContainersNamespace, getSandboxVersion, isContainerAlreadyCreated, setCustomDomainContainer, updateDeployedContainer, waitForContainerReady, waitForNamespaceReady };
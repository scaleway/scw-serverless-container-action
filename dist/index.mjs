import { setFailed } from "./node_modules/.pnpm/@actions_core@3.0.1/node_modules/@actions/core/lib/core.mjs";
import { createClient } from "./node_modules/.pnpm/@scaleway_sdk-client@2.6.0/node_modules/@scaleway/sdk-client/dist/scw/client.mjs";
import "./node_modules/.pnpm/@scaleway_sdk-client@2.6.0/node_modules/@scaleway/sdk-client/dist/index.mjs";
import { DEFAULTS, ENV } from "./constants.mjs";
import { envOr, printOutputs } from "./utils.mjs";
import { deploy, teardown } from "./orchestrator.mjs";

//#region src/index.ts
function createClientWrapper() {
	const accessKey = process.env[ENV.ACCESS_KEY];
	const secretKey = process.env[ENV.SECRET_KEY];
	if (!accessKey || !secretKey) throw new Error("SCW_ACCESS_KEY and SCW_SECRET_KEY are required");
	return createClient({
		accessKey,
		secretKey
	});
}
async function run() {
	try {
		const pathRegistry = process.env[ENV.REGISTRY];
		const region = envOr(ENV.REGION, DEFAULTS.REGION);
		const type = envOr(ENV.TYPE, DEFAULTS.TYPE);
		if (!pathRegistry) {
			setFailed("SCW_REGISTRY is not set");
			return;
		}
		const client = createClientWrapper();
		if (type === "deploy") {
			const result = await deploy(client, region, pathRegistry);
			printOutputs(result.container.domainName, result.domain?.hostname || `https://${result.container.domainName}`, result.container.id, result.container.namespaceId);
		} else if (type === "teardown") {
			const deletedContainer = await teardown(client, region, pathRegistry);
			printOutputs(deletedContainer.domainName, `https://${deletedContainer.domainName}`, deletedContainer.id, deletedContainer.namespaceId);
		} else setFailed(`Unknown type: ${type}. Valid types are: deploy, teardown`);
	} catch (error) {
		setFailed(error instanceof Error ? error.message : "An unknown error occurred");
	}
}
run();

//#endregion
export {  };
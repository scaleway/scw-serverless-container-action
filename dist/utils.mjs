import { setOutput as setOutput$1 } from "./node_modules/.pnpm/@actions_core@3.0.1/node_modules/@actions/core/lib/core.mjs";

//#region src/utils.ts
function envOr(name, defaultValue) {
	const value = process.env[name];
	return value !== void 0 ? value : defaultValue;
}
function envToInt(name, defaultValue) {
	const value = envOr(name, defaultValue.toString());
	const parsed = parseInt(value, 10);
	return isNaN(parsed) ? defaultValue : parsed;
}
function setOutput(name, value) {
	setOutput$1(name, value);
}
function printOutputs(containerUrl, url, containerId, namespaceId) {
	setOutput("url", url);
	setOutput("container_url", containerUrl);
	setOutput("scw_container_id", containerId);
	setOutput("scw_namespace_id", namespaceId);
}
function getContainerName(pathRegistry) {
	let name = pathRegistry.split(":")[1] || "";
	name = name.replace(/-/g, "");
	name = name.replace(/_/g, "");
	if (name.length > 34) name = name.substring(0, 34);
	return name;
}
function parseKeyValue(key) {
	const keyValue = {};
	const envValue = process.env[key] || "";
	if (!envValue) return keyValue;
	const pairs = envValue.split(",");
	for (const pair of pairs) {
		const splitEnv = pair.split("=");
		if (splitEnv.length === 2) keyValue[splitEnv[0]] = splitEnv[1];
	}
	return keyValue;
}

//#endregion
export { envOr, envToInt, getContainerName, parseKeyValue, printOutputs, setOutput };
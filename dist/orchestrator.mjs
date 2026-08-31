import { info, warning } from "./node_modules/.pnpm/@actions_core@3.0.1/node_modules/@actions/core/lib/core.mjs";
import { CLEANUP_DATE_FIELDS, DEFAULTS, ENV } from "./constants.mjs";
import { getContainerName } from "./utils.mjs";
import { deleteContainer, deployContainer, getContainer, getContainersNamespace, listContainersByNamespace, setCustomDomainContainer, waitForNamespaceReady } from "./container.mjs";
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
function getCleanupOptions() {
	return {
		maxAgeDays: parseInt(process.env[ENV.CLEANUP_MAX_AGE_DAYS] || DEFAULTS.CLEANUP_MAX_AGE_DAYS.toString(), 10),
		dateField: process.env[ENV.CLEANUP_DATE_FIELD] || DEFAULTS.CLEANUP_DATE_FIELD,
		excludeNames: (process.env[ENV.CLEANUP_EXCLUDE_NAMES] || "").split(",").map((name) => name.trim()).filter((name) => name.length > 0),
		dryRun: (process.env[ENV.CLEANUP_DRY_RUN] || DEFAULTS.CLEANUP_DRY_RUN.toString()) === "true"
	};
}
function filterStaleContainers(containers, options) {
	const { maxAgeDays, dateField, excludeNames } = options;
	if (dateField !== CLEANUP_DATE_FIELDS.CREATED_AT && dateField !== CLEANUP_DATE_FIELDS.UPDATED_AT) throw new Error(`Invalid cleanup_date_field: ${dateField}. Valid values: created_at, updated_at`);
	const excludeSet = new Set(excludeNames);
	const now = Date.now();
	const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1e3;
	return containers.filter((container) => {
		if (excludeSet.has(container.name)) return false;
		if (maxAgeDays > 0) {
			const dateValue = dateField === CLEANUP_DATE_FIELDS.CREATED_AT ? container.createdAt : container.updatedAt;
			if (!dateValue) {
				warning(`Container ${container.name} has no ${dateField}, skipping`);
				return false;
			}
			if (now - dateValue.getTime() < maxAgeMs) return false;
		}
		return true;
	});
}
async function cleanup(client, region) {
	const options = getCleanupOptions();
	info(`Cleanup config: max_age_days=${options.maxAgeDays}, date_field=${options.dateField}, exclude_names=${options.excludeNames.length > 0 ? options.excludeNames.join(", ") : "(none)"}, dry_run=${options.dryRun}`);
	const allContainers = await listContainersByNamespace(client, region);
	info(`Found ${allContainers.length} container(s) in namespace`);
	const staleContainers = filterStaleContainers(allContainers, options);
	info(`${staleContainers.length} container(s) match the cleanup filters`);
	const deletedContainers = [];
	for (const container of staleContainers) {
		const dateValue = options.dateField === CLEANUP_DATE_FIELDS.CREATED_AT ? container.createdAt : container.updatedAt;
		info(`Container ${container.name} (id: ${container.id}) - ${options.dateField}: ${dateValue?.toISOString() ?? "unknown"}`);
		if (options.dryRun) {
			info(`[dry-run] Would delete container ${container.name}`);
			deletedContainers.push(container);
			continue;
		}
		try {
			const deleted = await deleteContainer(client, region, container);
			info(`Container ${deleted.name} deleted`);
			deletedContainers.push(deleted);
		} catch (error) {
			warning(`Failed to delete container ${container.name}: ${error}`);
		}
	}
	return {
		totalCount: allContainers.length,
		deletedCount: deletedContainers.length,
		dryRun: options.dryRun,
		deletedContainers
	};
}

//#endregion
export { cleanup, deploy, setupDomain, teardown };
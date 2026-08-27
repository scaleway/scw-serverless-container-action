//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let _actions_core = require("@actions/core");
_actions_core = __toESM(_actions_core, 1);
let _scaleway_sdk_container = require("@scaleway/sdk-container");
let _scaleway_sdk_domain = require("@scaleway/sdk-domain");

//#region node_modules/@scaleway/sdk-client/dist/helpers/json.js
/**
* Validates an unknown object is a JSON Object.
*
* @internal
*/
var isJSONObject = (obj) => {
	const objT = typeof obj;
	return obj !== void 0 && obj !== null && objT !== "string" && objT !== "number" && objT !== "boolean" && !Array.isArray(obj) && objT === "object";
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/vendor/base64/index.js
var lookup = [];
var revLookup = [];
var i;
var len;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (i = 0, len = code.length; i < len; ++i) {
	lookup[i] = code[i];
	revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/internal/logger/level-resolver.js
var LevelResolver = /* @__PURE__ */ function(LevelResolver) {
	LevelResolver[LevelResolver["silent"] = 0] = "silent";
	LevelResolver[LevelResolver["error"] = 1] = "error";
	LevelResolver[LevelResolver["warn"] = 2] = "warn";
	LevelResolver[LevelResolver["info"] = 3] = "info";
	LevelResolver[LevelResolver["debug"] = 4] = "debug";
	return LevelResolver;
}({});
var shouldLog = (currentLevel, level) => LevelResolver[level] <= currentLevel;

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/internal/logger/console-logger.js
/**
* A Logger using console output.
*
* @param logLevel - The logger level name
* @param prefix - An optional logger message prefix
* @param output - The output to print logs, using by default the global console object
*
* @internal
*/
var ConsoleLogger = class {
	constructor(logLevel, prefix = "", output = console) {
		this.logLevel = logLevel;
		this.prefix = prefix;
		this.output = output;
		this.debug = this.makeMethod("debug");
		this.error = this.makeMethod("error");
		this.info = this.makeMethod("info");
		this.warn = this.makeMethod("warn");
		this.level = LevelResolver[this.logLevel];
	}
	makeMethod(method) {
		return (message) => {
			if (shouldLog(this.level, method)) this.output[method](this.prefix ? `${this.prefix} ${message}` : message);
		};
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/internal/logger/index.js
var sdkLogger = new ConsoleLogger("silent");
/**
* Returns the active SDK logger.
*
* @internal
*/
var getLogger = () => sdkLogger;

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/internal/interceptors/helpers.js
/**
* Adds an header to a request through an interceptor.
*
* @param key - The header key
* @param value - The header value
* @returns The Request interceptor
*
* @internal
*/
var addHeaderInterceptor = (key, value) => ({ request }) => {
	const clone = request.clone();
	if (value !== void 0) clone.headers.append(key, value);
	return clone;
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/package.js
var name = "@scaleway/sdk-client";
var version$1 = "2.5.0";
var description = "Scaleway SDK Client";
var keywords = [
	"client",
	"cloud",
	"scaleway",
	"sdk"
];
var license = "Apache-2.0";
var repository = {
	"type": "git",
	"url": "git+https://github.com/scaleway/scaleway-sdk-js",
	"directory": "packages/client"
};
var files = ["dist"];
var type = "module";
var exports$1 = { ".": {
	"types": "./dist/index.d.ts",
	"default": "./dist/index.js"
} };
var publishConfig = { "access": "public" };
var scripts = {
	"typecheck": "tsc --noEmit",
	"type:generate": "tsc --declaration -p tsconfig.build.json",
	"build": "vite build --config ../../vite.config.ts && pnpm run type:generate",
	"build:profile": "npx vite-bundle-visualizer -c ../../vite.config.ts"
};
var devDependencies = {
	"@repo/configs": "workspace:^",
	"@types/node": "catalog:"
};
var engines = { "node": ">=20.20.2" };
var package_default = {
	name,
	version: version$1,
	description,
	keywords,
	license,
	repository,
	files,
	type,
	exports: exports$1,
	publishConfig,
	scripts,
	devDependencies,
	engines
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/constants.js
var { version } = package_default;
var userAgent = `scaleway-sdk-js/${version}`;
var AUTH_HEADER_KEY = "x-auth-token";

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/internal/validations/string-validation.js
var isAccessKeyRegex = /^SCW[A-Z0-9]{17}$/i;
var isRegionRegex = /^[a-z]{2}-[a-z]{3}$/i;
var isUUIDRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
var isZoneRegex = /^[a-z]{2}-[a-z]{3}-[1-9]$/i;
/** Returns true if the given string has a valid UUID format. */
var isUUID = (str) => isUUIDRegex.test(str);
/** Returns true if the given string has a valid Scaleway access key format. */
var isAccessKey = (str) => isAccessKeyRegex.test(str);
/** Returns true if the given string has a valid Scaleway secret key format. */
var isSecretKey = (str) => isUUID(str);
/** Returns true if the given string has a valid Scaleway organization ID format. */
var isOrganizationId = (str) => isUUID(str);
/** Returns true if the given string has a valid Scaleway project ID format. */
var isProjectId = (str) => isUUID(str);
/** Returns true if the given string has a valid region format. */
var isRegion = (str) => isRegionRegex.test(str);
/** Returns true if the given string has a valid zone format. */
var isZone = (str) => isZoneRegex.test(str);
/** Returns true if the given string has a valid URL format and starts by `http(s):`. */
var isURL = (str) => {
	let url;
	try {
		url = new URL(str);
	} catch {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/client-ini-profile.js
/**
* Verifies that the payload contains both the accessKey and the secretKey.
*
* @param obj - The secrets
* @returns Whether the secrets are not empty.
*
* @internal
*/
var hasAuthenticationSecrets = (obj) => typeof obj.accessKey === "string" && obj.accessKey !== "" && typeof obj.secretKey === "string" && obj.secretKey !== "";
/**
* Asserts the format of secrets.
*
* @param obj - The secrets
* @returns Whether the secrets use a valid format
*
* @throws Error
* Thrown if either the accessKey or the secretKey has en invalid format.
*
* @internal
*/
function assertValidAuthenticationSecrets(obj) {
	if (!(obj.accessKey && obj.secretKey)) throw new Error(`Invalid secrets, accessKey & secretKey must be defined. See https://www.scaleway.com/en/docs/identity-and-access-management/iam/how-to/create-api-keys/`);
	if (!isAccessKey(obj.accessKey)) throw new Error(`Invalid access key format '${obj.accessKey}', expected SCWXXXXXXXXXXXXXXXXX format. See https://www.scaleway.com/en/docs/identity-and-access-management/iam/how-to/create-api-keys/`);
	if (!isSecretKey(obj.secretKey)) throw new Error(`Invalid secret key format '${obj.secretKey}', expected a UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. See https://www.scaleway.com/en/docs/identity-and-access-management/iam/how-to/create-api-keys/`);
}

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/auth.js
/**
* Authenticates with a secrets.
*
* @param getToken - The secrets
* @returns The request interceptor
*
* @throws Error
* Thrown if the secrets are invalid.
*
* @internal
*/
var authenticateWithSecrets = (secrets) => {
	assertValidAuthenticationSecrets(secrets);
	return addHeaderInterceptor(AUTH_HEADER_KEY, secrets.secretKey);
};
/**
* Obfuscates a token.
*
* @param key - The token
* @returns The obfuscated token
*
* @internal
*/
var obfuscateToken = (key) => `${key.substring(0, 5)}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`;
/**
* Obfuscates an UUID.
*
* @param key - The UUID
* @returns The obfuscated UUID
*
* @internal
*/
var obfuscateUUID = (key) => `${key.substring(0, 8)}-xxxx-xxxx-xxxx-xxxxxxxxxxxx`;
/**
* Obfuscates headers entry.
*
* @param array - The header entry
* @returns The obfuscated entry
*
* @internal
*/
var obfuscateAuthHeadersEntry = ([name, value]) => {
	if (name === "x-session-token") return [name, obfuscateToken(value)];
	if (name === "x-auth-token") return [name, obfuscateUUID(value)];
	return [name, value];
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/client-ini-factory.js
/**
* Instantiates the SDK from a configuration {@link Profile}.
*
* @param profile - The profile
* @returns A factory {@link ClientConfig}
*
* @remarks This method should be used in conjunction with the initializer `createAdvancedClient`.
*
* @public
*/
var withProfile = (profile) => (settings) => {
	const newSettings = { ...settings };
	if (profile.apiURL) newSettings.apiURL = profile.apiURL;
	if (profile.defaultOrganizationId) newSettings.defaultOrganizationId = profile.defaultOrganizationId;
	if (profile.defaultProjectId) newSettings.defaultProjectId = profile.defaultProjectId;
	if (profile.defaultRegion) newSettings.defaultRegion = profile.defaultRegion;
	if (profile.defaultZone) newSettings.defaultZone = profile.defaultZone;
	if (hasAuthenticationSecrets(profile)) newSettings.interceptors = [{ request: authenticateWithSecrets(profile) }, ...newSettings.interceptors];
	return newSettings;
};
/**
* Instantiates the SDK with additional interceptors.
*
* @param interceptors - The additional {@link NetworkInterceptors} interceptors
* @returns A factory {@link ClientConfig}
*
* @remarks
* It doesn't override the existing interceptors, but instead push more to the list.
* This method should be used in conjunction with the initializer `createAdvancedClient`.
*
* @example
* ```
* withAdditionalInterceptors([
*   {
*     request: ({ request }) => {
*       console.log(`Do something with ${JSON.stringify(request)}`)
*       return request
*     },
*     response: ({ response }) => {
*       console.log(`Do something with ${JSON.stringify(response)}`)
*       return response
*     },
*     responseError: async ({
*       request,
*       error,
*     }: {
*       request: Request
*       error: unknown
*     }) => {
*       console.log(
*         `Do something with ${JSON.stringify(request)} and ${JSON.stringify(
*           error,
*         )}`,
*       )
*       throw error // or return Promise.resolve(someData)
*     },
*   },
* ])
* ```
*
* @public
*/
var withAdditionalInterceptors = (interceptors) => (settings) => ({
	...settings,
	interceptors: settings.interceptors.concat(interceptors)
});
/**
* Instantiates the SDK with legacy interceptors.
*/
var withLegacyInterceptors = () => (settings) => {
	if (!settings.requestInterceptors && !settings.responseInterceptors) return settings;
	const allInterceptors = settings.interceptors.concat((settings.requestInterceptors ?? []).map((obj) => ({ request: obj })), (settings.responseInterceptors ?? []).map((obj) => ({ response: obj })));
	return {
		...settings,
		interceptors: allInterceptors
	};
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/client-settings.js
/**
* Validates the content of a {@link Settings} object.
*
* @throws Error
* Thrown if {@link Settings} aren't valid.
*
* @internal
*/
var assertValidSettings = (obj) => {
	if (obj.defaultOrganizationId !== void 0) {
		if (typeof obj.defaultOrganizationId !== "string" || obj.defaultOrganizationId.length === 0) throw new Error("Default organization ID cannot be empty");
		if (!isOrganizationId(obj.defaultOrganizationId)) throw new Error(`Invalid organization ID format '${obj.defaultOrganizationId}', expected a UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`);
	}
	if (obj.defaultProjectId !== void 0) {
		if (typeof obj.defaultProjectId !== "string" || obj.defaultProjectId.length === 0) throw new Error("Default project ID cannot be empty");
		if (!isProjectId(obj.defaultProjectId)) throw new Error(`Invalid project ID format '${obj.defaultProjectId}', expected a UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`);
	}
	if (obj.defaultRegion && !isRegion(obj.defaultRegion)) throw new Error(`Invalid default region format '${obj.defaultRegion}'`);
	if (obj.defaultZone && !isZone(obj.defaultZone)) throw new Error(`Invalid default zone format '${obj.defaultZone}'`);
	if (obj.apiURL && !isURL(obj.apiURL)) throw new Error(`Invalid URL ${obj.apiURL}`);
	if (obj.apiURL?.endsWith("/")) throw new Error(`Invalid URL ${obj.apiURL}: it should not have a trailing slash`);
	if (typeof obj.httpClient !== typeof fetch) throw new Error(`Invalid HTTP Client`);
	if (obj.defaultPageSize !== void 0 && (typeof obj.defaultPageSize !== "number" || Number.isNaN(obj.defaultPageSize) || obj.defaultPageSize <= 0)) throw new Error(`Invalid defaultPageSize ${obj.defaultPageSize}: it should be a number above 0`);
	if (typeof obj.userAgent !== "string") throw new Error(`Invalid User-Agent`);
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/helpers/is-browser.js
var isBrowser = () => typeof window !== "undefined" && typeof window.document !== "undefined";

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/internal/interceptors/composer.js
/**
* Composes request interceptors.
*
* @param interceptors - A list of request interceptors
* @returns An async composed interceptor
*
* @internal
*/
var composeRequestInterceptors = (interceptors) => async (request) => interceptors.reduce(async (asyncResult, interceptor) => interceptor({ request: await asyncResult }), Promise.resolve(request));
/**
* Composes response interceptors.
*
* @param interceptors - A list of response interceptors
* @returns An async composed interceptor
*
* @internal
*/
var composeResponseInterceptors = (interceptors) => async (response) => interceptors.reduce(async (asyncResult, interceptor) => interceptor({ response: await asyncResult }), Promise.resolve(response));
/**
* Compose response error interceptors.
*
* @internal
*/
var composeResponseErrorInterceptors = (interceptors) => async (request, error) => {
	let prevError = error;
	for (const interceptor of interceptors) try {
		return await interceptor({
			request,
			error: prevError
		});
	} catch (err) {
		prevError = err;
	}
	throw prevError;
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/fetch/http-dumper.js
/**
* Converts a string to PascalCase.
*
* @param str - The input string
* @returns The string in PascalCase
*
* @internal
*/
var toPascalCase = (str) => str.replace(/\w+/g, (word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`);
/**
* Converts a Headers entry to string.
*
* @param entry - The header entry as a string tuple
* @returns A serialized string
*
* @internal
*/
var serializeHeadersEntry = ([name, value]) => `${toPascalCase(name)}: ${value}`;
/**
* Converts Headers to safe to log strings (with obfuscated auth secrets).
*
* @param headers - The Headers
* @returns Serialized headers strings
*
* @internal
*/
var serializeHeaders = (headers) => Array.from(headers.entries(), serializeHeadersEntry);
/**
* Dumps a Request into a readable string.
*
* @param request - The request
* @returns The readable string
*
* @internal
*/
var dumpRequest = async (request) => [
	`${request.method.toUpperCase()}: ${request.url}`,
	...serializeHeaders(request.headers),
	await request.clone().text()
].join("\r\n");
/**
* Dumps a Response into a readable string.
*
* @param response - The response
* @returns The readable string
*
* @internal
*/
var dumpResponse = async (response) => [
	`HTTP ${response.status} ${response.ok ? "OK" : "NOK"}`,
	...serializeHeaders(response.headers),
	await response.clone().text()
].join("\r\n");

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/fetch/http-interceptors.js
/**
* HTTP Request with obfuscated secrets.
*
* @internal
*/
var ObfuscatedRequest = class ObfuscatedRequest extends Request {
	constructor(request, obfuscate) {
		super(request);
		this.request = request;
		this.obfuscate = obfuscate;
	}
	get headers() {
		return new Headers(Array.from(this.request.headers, this.obfuscate));
	}
	clone() {
		return new ObfuscatedRequest(this.request, this.obfuscate);
	}
};
/**
* Creates an interceptor to obfuscate the requests.
*
* @param obfuscate - The Header entries obfuscator mapper
* @returns The obfuscated Request
*
* @internal
*/
var obfuscateInterceptor = (obfuscate) => ({ request }) => new ObfuscatedRequest(request, obfuscate);
var identity = ({ request }) => request;
/**
* Creates an interceptor to log the requests.
*
* @param identifier - The request identifier
* @param obfuscate - The obfuscation interceptor
* @returns The interceptor
*
* @internal
*/
var logRequest = (identifier, obfuscate = identity) => async ({ request }) => {
	if (shouldLog(LevelResolver[getLogger().logLevel], "debug")) getLogger().debug(`--------------- Scaleway SDK REQUEST ${identifier} ---------------
${await dumpRequest(await obfuscate({ request }))}
---------------------------------------------------------`);
	return request;
};
/**
* Creates an interceptor to log the responses.
*
* @param identifier - The request identifier
* @returns The interceptor
*
* @internal
*/
var logResponse = (identifier) => async ({ response }) => {
	if (shouldLog(LevelResolver[getLogger().logLevel], "debug")) getLogger().debug(`--------------- Scaleway SDK RESPONSE ${identifier} ---------------
${await dumpResponse(response)}
---------------------------------------------------------`);
	return response;
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/helpers/is-response.js
/**
* Validates an object is of type Response without using `instanceof`.
*
* @remarks Check issue #509 for more context.
*
* @internal
*/
var isResponse = (obj) => obj !== null && obj !== void 0 && typeof obj === "object" && "status" in obj && typeof obj.status === "number" && "statusText" in obj && typeof obj.statusText === "string" && "headers" in obj && typeof obj.headers === "object" && "body" in obj && typeof obj.body !== "undefined";

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/types.js
/**
* Verifies the object is a record of string to string[].
*
* @param obj - The object
* @returns Whether the object is of the expected type
*
* @internal
*/
var isRecordOfStringArray = (obj) => {
	if (!isJSONObject(obj)) return false;
	for (const elt of Object.values(obj)) if (!Array.isArray(elt) || Object.values(elt).find((x) => typeof x !== "string") !== void 0) return false;
	return true;
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/scw-error.js
/**
* Builds the default message for {@link ScalewayError}.
*
* @param status - The response code
* @param body - The response body
* @returns The error message
*
* @internal
*/
var buildDefaultMessage = (status, body) => {
	const message = [`http error ${status}`];
	if (typeof body === "string") message.push(body);
	else if (isJSONObject(body)) {
		if (typeof body.resource === "string") message.push(`resource ${body.resource}`);
		if (typeof body.message === "string") message.push(body.message);
		if (body.fields && isRecordOfStringArray(body.fields)) message.push(Object.entries(body.fields).map(([name, list]) => `${name} (${list.join(", ")})`).join(", "));
	}
	return message.join(": ");
};
/**
* Scaleway error.
*
* @public
*/
var ScalewayError = class ScalewayError extends Error {
	constructor(status, body, message = buildDefaultMessage(status, body)) {
		super(message);
		this.status = status;
		this.body = body;
		this.message = message;
		this.name = "ScalewayError";
		this.rawMessage = typeof body === "object" && typeof body.message === "string" ? body.message : void 0;
		Object.setPrototypeOf(this, new.target.prototype);
	}
	static fromJSON(status, obj) {
		return new ScalewayError(status, obj);
	}
	toString() {
		return `${this.name}: ${this.message}`;
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/invalid-arguments-error.js
/**
* Build the default message for {@link InvalidArgumentsError}.
*
* @param list - The list of {@link InvalidArgumentsErrorDetails}
* @returns The error message
*
* @internal
*/
var buildMessage$5 = (list) => {
	return `invalid argument(s): ${list.reduce((acc, details) => {
		let readableReason = "";
		switch (details.reason) {
			case "required":
				readableReason = `is required`;
				break;
			case "format":
				readableReason = `is wrongly formatted`;
				break;
			case "constraint":
				readableReason = `does not respect constraint`;
				break;
			default: readableReason = `is invalid for unexpected reason`;
		}
		if (details.helpMessage && details.helpMessage.length > 0) readableReason = readableReason.concat(`, `, details.helpMessage);
		acc.push(`${details.argumentName} ${readableReason}`);
		return acc;
	}, []).join("; ")}`;
};
/**
* InvalidArguments error happens when one or many fields are invalid in the request message.
*
* @public
*/
var InvalidArgumentsError = class InvalidArgumentsError extends ScalewayError {
	constructor(status, body, details) {
		super(status, body, buildMessage$5(details));
		this.status = status;
		this.body = body;
		this.details = details;
		this.name = "InvalidArgumentsError";
	}
	static fromJSON(status, obj) {
		if (!Array.isArray(obj.details)) return null;
		return new InvalidArgumentsError(status, obj, obj.details.reduce((list, detail) => isJSONObject(detail) && typeof detail.argument_name === "string" && typeof detail.reason === "string" ? list.concat({
			argumentName: detail.argument_name,
			helpMessage: typeof detail.help_message === "string" ? detail.help_message : void 0,
			reason: detail.reason
		}) : list, []));
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/quotas-exceeded-error.js
/**
* Build the default message for {@link QuotasExceededError}.
*
* @param list - The list of {@link QuotasExceededErrorDetails}
* @returns The error message
*
* @internal
*/
var buildMessage$4 = (list) => `quota(s) exceeded: ${list.map((details) => {
	const message = `Quotas reached: You have reached the maximum number of ${details.resource} authorized by your Organization. Access the quotas page from your Organization dashboard to manage quotas.`;
	return details.scope ? `${message} for ${details.scope.kind} '${details.scope.id}'` : message;
}).join("; ")}`;
var buildScope = (detail) => {
	if (typeof detail.organization_id === "string" && detail.organization_id.length) return {
		id: detail.organization_id,
		kind: "organization"
	};
	if (typeof detail.project_id === "string" && detail.project_id.length) return {
		id: detail.project_id,
		kind: "project"
	};
};
/**
* QuotasExceeded error happens when one or many resource exceed quotas during the creation of a resource.
*
* @public
*/
var QuotasExceededError = class QuotasExceededError extends ScalewayError {
	constructor(status, body, list) {
		super(status, body, buildMessage$4(list));
		this.status = status;
		this.body = body;
		this.list = list;
		this.name = "QuotasExceededError";
	}
	static fromJSON(status, obj) {
		if (!Array.isArray(obj.details)) return null;
		return new QuotasExceededError(status, obj, obj.details.reduce((list, detail) => isJSONObject(detail) && typeof detail.resource === "string" && typeof detail.quota === "number" && typeof detail.current === "number" ? list.concat({
			current: detail.current,
			quota: detail.quota,
			resource: detail.resource,
			scope: buildScope(detail)
		}) : list, []));
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/non-standard/invalid-request-mapper.js
/**
* InvalidRequest error is only returned by the instance API.
*
* @public
*/
var mapInvalidRequestFromJSON = (status, obj) => {
	if (typeof obj.message === "string" && obj.message.toLowerCase().includes("quota exceeded for this resource")) return new QuotasExceededError(status, obj, [{
		current: 0,
		quota: 0,
		resource: typeof obj.resource === "string" ? obj.resource : ""
	}]);
	const fields = obj.fields && isRecordOfStringArray(obj.fields) ? obj.fields : {};
	const fieldsMessages = Object.entries(fields);
	if (fieldsMessages.length) return new InvalidArgumentsError(status, obj, fieldsMessages.flatMap(([argumentName, messages]) => messages.map((helpMessage) => ({
		argumentName,
		helpMessage,
		reason: "constraint"
	}))));
	return new ScalewayError(status, obj);
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/resource-not-found-error.js
/**
* ResourceNotFound error happens when getting a resource that does not exist anymore.
*
* @public
*/
var ResourceNotFoundError = class ResourceNotFoundError extends ScalewayError {
	constructor(status, body, resource, resourceId) {
		super(status, body, `resource ${resource} with ID ${resourceId} is not found`);
		this.status = status;
		this.body = body;
		this.resource = resource;
		this.resourceId = resourceId;
		this.name = "ResourceNotFoundError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.resource !== "string" || typeof obj.resource_id !== "string") return null;
		return new ResourceNotFoundError(status, obj, obj.resource, obj.resource_id);
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/non-standard/unknown-resource-mapper.js
/**
* UnknownResource error is only returned by the instance API.
*
* @public
*/
var mapUnknownResourceFromJSON = (status, obj) => {
	const messageParts = typeof obj.message === "string" ? obj.message.split(/"|'/) : [];
	if (messageParts.length === 3 && isUUID(messageParts[1])) return new ResourceNotFoundError(status, obj, messageParts[0].trim().toLowerCase().split(" ").join("_"), messageParts[1]);
	return new ScalewayError(status, obj);
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/already-exists-error.js
/**
* AlreadyExists error is used when a resource already exists.
*
* @public
*/
var AlreadyExistsError = class AlreadyExistsError extends ScalewayError {
	constructor(status, body, resource, resourceId, helpMessage) {
		super(status, body, `resource ${resource} with ID ${resourceId} already exists: ${helpMessage}`);
		this.status = status;
		this.body = body;
		this.resource = resource;
		this.resourceId = resourceId;
		this.helpMessage = helpMessage;
		this.name = "AlreadyExistsError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.resource !== "string" || typeof obj.resource_id !== "string" || typeof obj.help_message !== "string") return null;
		return new AlreadyExistsError(status, obj, obj.resource, obj.resource_id, obj.help_message);
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/denied-authentication-error.js
/**
* Build the default message for {@link DeniedAuthenticationError}.
*
* @param method - The authentication method
* @param reason - The deny reason
* @returns The error message
*
* @internal
*/
var buildMessage$3 = (method, reason) => {
	let reasonDesc;
	switch (reason) {
		case "invalid_argument":
			reasonDesc = `invalid ${method} format or empty value`;
			break;
		case "not_found":
			reasonDesc = `${method} does not exist`;
			break;
		case "expired":
			reasonDesc = `${method} is expired`;
			break;
		default: reasonDesc = `unknown reason for ${method}`;
	}
	return `denied authentication: ${reasonDesc}`;
};
/**
* DeniedAuthentication error is used by the API Gateway auth service to deny a request.
*
* @public
*/
var DeniedAuthenticationError = class DeniedAuthenticationError extends ScalewayError {
	constructor(status, body, method, reason) {
		super(status, body, buildMessage$3(method, reason));
		this.status = status;
		this.body = body;
		this.method = method;
		this.reason = reason;
		this.name = "DeniedAuthenticationError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.method !== "string" || typeof obj.reason !== "string") return null;
		return new DeniedAuthenticationError(status, obj, obj.method, obj.reason);
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/out-of-stock-error.js
/**
* OutOfStock error happens when stocks are empty for the resource.
*
* @public
*/
var OutOfStockError = class OutOfStockError extends ScalewayError {
	constructor(status, body, resource) {
		super(status, body, `resource ${resource} is out of stock`);
		this.status = status;
		this.body = body;
		this.resource = resource;
		this.name = "OutOfStockError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.resource !== "string") return null;
		return new OutOfStockError(status, obj, obj.resource);
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/permissions-denied-error.js
/**
* Build the default message for {@link PermissionsDeniedError}.
*
* @param list - The list of {@link PermissionsDeniedErrorDetails}
* @returns The error message
*
* @internal
*/
var buildMessage$2 = (list) => `insufficient permissions: ${list.map(({ action, resource }) => `${action} ${resource}`).join("; ")}`;
/**
* PermissionsDenied error happens when one or many permissions are not accorded to the user making the request.
*
* @public
*/
var PermissionsDeniedError = class PermissionsDeniedError extends ScalewayError {
	constructor(status, body, list) {
		super(status, body, buildMessage$2(list));
		this.status = status;
		this.body = body;
		this.list = list;
		this.name = "PermissionsDeniedError";
	}
	static fromJSON(status, obj) {
		if (!Array.isArray(obj.details)) return null;
		return new PermissionsDeniedError(status, obj, obj.details.reduce((list, detail) => isJSONObject(detail) && typeof detail.resource === "string" && typeof detail.action === "string" ? list.concat({
			action: detail.action,
			resource: detail.resource
		}) : list, []));
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/precondition-failed-error.js
/**
* Build the default message for {@link PreconditionFailedError}.
*
* @param precondition - The precondition
* @param helpMessage - The message which should help the user to fix the root cause
* @returns The error message
*
* @internal
*/
var buildMessage$1 = (precondition, helpMessage) => {
	let message = `precondition failed: ${precondition}`;
	if (typeof helpMessage === "string" && helpMessage.length > 0) message = message.concat(", ", helpMessage);
	return message;
};
/**
* PreconditionFailed error is used when a precondition is not respected.
*
* @public
*/
var PreconditionFailedError = class PreconditionFailedError extends ScalewayError {
	constructor(status, body, precondition, helpMessage) {
		super(status, body, buildMessage$1(precondition, helpMessage));
		this.status = status;
		this.body = body;
		this.precondition = precondition;
		this.helpMessage = helpMessage;
		this.name = "PreconditionFailedError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.precondition !== "string" || typeof obj.help_message !== "string") return null;
		return new PreconditionFailedError(status, obj, obj.precondition, obj.help_message);
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/resource-expired-error.js
/**
* ResourceExpired error happens when trying to access a resource that has expired.
*
* @public
*/
var ResourceExpiredError = class ResourceExpiredError extends ScalewayError {
	constructor(status, body, resource, resourceId, expiredSince) {
		super(status, body, `resource ${resource} with ID ${resourceId} expired since ${expiredSince.toISOString()}`);
		this.status = status;
		this.body = body;
		this.resource = resource;
		this.resourceId = resourceId;
		this.expiredSince = expiredSince;
		this.name = "ResourceExpiredError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.resource !== "string" || typeof obj.resource_id !== "string" || typeof obj.expired_since !== "string") return null;
		return new ResourceExpiredError(status, obj, obj.resource, obj.resource_id, new Date(obj.expired_since));
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/resource-locked-error.js
/**
* ResourceLocked error happens when a resource is locked by trust and safety.
*
* @public
*/
var ResourceLockedError = class ResourceLockedError extends ScalewayError {
	constructor(status, body, resource, resourceId) {
		super(status, body, `resource ${resource} with ID ${resourceId} is locked`);
		this.status = status;
		this.body = body;
		this.resource = resource;
		this.resourceId = resourceId;
		this.name = "ResourceLockedError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.resource !== "string" || typeof obj.resource_id !== "string") return null;
		return new ResourceLockedError(status, obj, obj.resource, obj.resource_id);
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/too-many-requests-error.js
/**
* Build the default message for {@link TooManyRequestsError}.
*
* @internal
*/
var buildMessage = (helpMessage, limit, resetSeconds, resetAt) => {
	const details = [];
	if (limit) if (limit.windowSeconds) details.push(`quota is ${limit.quota} for ${limit.windowSeconds}s`);
	else details.push(`quota is ${limit.quota}`);
	if (resetSeconds) details.push(`resets in ${resetSeconds}s`);
	else if (resetAt) details.push(`resets at ${resetAt.toISOString()}`);
	let output = `too many requests`;
	if (details.length > 0) output += ` (${details.join(", ")})`;
	if (helpMessage.length > 0) output += `: ${helpMessage}`;
	return output;
};
/**
* TooManyRequestsError error happens when fetching too many times a resource.
*
* @public
*/
var TooManyRequestsError = class TooManyRequestsError extends ScalewayError {
	constructor(status, body, helpMessage, limit, resetSeconds, resetAt) {
		super(status, body, buildMessage(helpMessage, limit, resetSeconds, resetAt));
		this.status = status;
		this.body = body;
		this.helpMessage = helpMessage;
		this.limit = limit;
		this.resetSeconds = resetSeconds;
		this.resetAt = resetAt;
		this.name = "TooManyRequestsError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.help_message !== "string") return null;
		let limit;
		if (isJSONObject(obj.limit) && typeof obj.limit.quota === "number") limit = {
			quota: obj.limit.quota,
			windowSeconds: typeof obj.limit.window_seconds === "number" ? obj.limit.window_seconds : void 0
		};
		return new TooManyRequestsError(status, obj, obj.help_message, limit, typeof obj.reset_seconds === "number" ? obj.reset_seconds : void 0, typeof obj.reset_at === "string" ? new Date(obj.reset_at) : void 0);
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/standard/transient-state-error.js
/**
* TransientState error happens when trying to perform an action on a resource in a transient state.
*
* @public
*/
var TransientStateError = class TransientStateError extends ScalewayError {
	constructor(status, body, resource, resourceId, currentState) {
		super(status, body, `resource ${resource} with ID ${resourceId} is in a transient state: ${currentState}`);
		this.status = status;
		this.body = body;
		this.resource = resource;
		this.resourceId = resourceId;
		this.currentState = currentState;
		this.name = "TransientStateError";
	}
	static fromJSON(status, obj) {
		if (typeof obj.resource !== "string" || typeof obj.resource_id !== "string" || typeof obj.current_state !== "string") return null;
		return new TransientStateError(status, obj, obj.resource, obj.resource_id, obj.current_state);
	}
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/errors/error-parser.js
/**
* Unmarshals a standard error from raw body.
*
* @param type - The error type
* @param status - The status code
* @param body - The error response
* @returns The standard error if found
*
* @internal
*/
var unmarshalStandardError = (type, status, body) => {
	let error;
	switch (type) {
		case "denied_authentication":
			error = DeniedAuthenticationError;
			break;
		case "invalid_arguments":
			error = InvalidArgumentsError;
			break;
		case "out_of_stock":
			error = OutOfStockError;
			break;
		case "permissions_denied":
			error = PermissionsDeniedError;
			break;
		case "precondition_failed":
			error = PreconditionFailedError;
			break;
		case "quotas_exceeded":
			error = QuotasExceededError;
			break;
		case "expired":
			error = ResourceExpiredError;
			break;
		case "not_found":
			error = ResourceNotFoundError;
			break;
		case "locked":
			error = ResourceLockedError;
			break;
		case "transient_state":
			error = TransientStateError;
			break;
		case "already_exists":
			error = AlreadyExistsError;
			break;
		case "too_many_requests":
			error = TooManyRequestsError;
			break;
		default: return null;
	}
	return error.fromJSON(status, body);
};
/**
* Unmarshals a non-standard error from raw body.
*
* @param type - The error type
* @param status - The status code
* @param body - The error response
* @returns The non-standard error if found
*
* @internal
*/
var unmarshalNonStandardError = (type, status, body) => {
	switch (type) {
		case "unknown_resource": return mapUnknownResourceFromJSON(status, body);
		case "invalid_request_error": return mapInvalidRequestFromJSON(status, body);
		default: return null;
	}
};
/**
* Parses Scaleway error from raw body.
*
* @param status - The status code
* @param body - The error response
* @returns The resolved error
*
* @internal
*/
var parseScalewayError = (status, body) => {
	return typeof body.type === "string" && (unmarshalStandardError(body.type, status, body) ?? unmarshalNonStandardError(body.type, status, body)) || new ScalewayError(status, body);
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/fetch/response-parser.js
var X_TOTAL_COUNT_HEADER_KEY = "x-total-count";
var TOTAL_COUNT_RES_KEY = "total_count";
/**
* Fixes the totalCount property for old APIs.
*
* @internal
*/
var fixLegacyTotalCount = (obj, headers) => {
	const headerVal = headers.get(X_TOTAL_COUNT_HEADER_KEY);
	if (!headerVal) return obj;
	const totalCount = parseInt(headerVal, 10);
	if (Number.isNaN(totalCount)) return obj;
	if (isJSONObject(obj) && !(TOTAL_COUNT_RES_KEY in obj)) return Object.assign(obj, { [TOTAL_COUNT_RES_KEY]: totalCount });
	return obj;
};
/**
* Makes response parser.
*
* @param unmarshaller - The response payload unmarshaller
* @returns An async converter of HTTP Response to desired result
*
* @throws {@link ScalewayError}
* Thrown by the API if the request couldn't be completed.
*
* @throws TypeError
* Thrown if the response parameter isn't of the expected type.
*
* @throws Error
* JSON parsing could trigger an error.
*
* @internal
*/
var responseParser = (unmarshaller, responseType) => async (response) => {
	if (!isResponse(response)) throw new TypeError("Invalid response object");
	if (response.ok) {
		if (response.status === 204) return unmarshaller(void 0);
		const contentType = response.headers.get("Content-Type");
		try {
			if (responseType === "json" && contentType === "application/json") return unmarshaller(fixLegacyTotalCount(await response.json(), response.headers));
			if (responseType === "blob") return unmarshaller(await response.blob());
			return unmarshaller(await response.text());
		} catch (err) {
			throw new ScalewayError(response.status, `could not parse '${contentType ?? ""}' response${err instanceof Error ? `: ${err.message}` : ""}`);
		}
	}
	const error = await response.clone().json().catch(() => response.text());
	if (isJSONObject(error)) throw parseScalewayError(response.status, error);
	throw new ScalewayError(response.status, typeof error === "string" ? error : "cannot read error response body");
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/fetch/build-fetcher.js
/**
* Builds Request from {@link ScwRequest} & {@link Settings}.
*
* @param request - A scaleway request
* @param settings - The settings
* @returns A fetch Request
*
* @internal
*/
var buildRequest = (request, settings) => {
	let { path } = request;
	if (request.urlParams instanceof URLSearchParams) path = path.concat(`?${request.urlParams.toString()}`);
	return new Request(`${settings.apiURL}${path}`, {
		body: request.body,
		headers: {
			Accept: "application/json",
			...!isBrowser() ? { "User-Agent": settings.userAgent } : {},
			...request.headers
		},
		method: request.method
	});
};
var asIs = (response) => response;
/**
* Builds a resource fetcher.
*
* @param settings - The {@link Settings} object
* @param httpClient - The HTTP client that should be used to call the API
* @returns The fetcher
*
* @internal
*/
var buildFetcher = (settings, httpClient) => {
	let requestNumber = 0;
	const prepareRequest = (requestId) => composeRequestInterceptors([...settings.interceptors.map((obj) => obj.request).filter((obj) => obj), logRequest(requestId, obfuscateInterceptor(obfuscateAuthHeadersEntry))]);
	const prepareResponse = (requestId) => composeResponseInterceptors([...settings.interceptors.map((obj) => obj.response).filter((obj) => obj), logResponse(requestId)]);
	const prepareResponseErrors = () => composeResponseErrorInterceptors(settings.interceptors.map((obj) => obj.responseError).filter((obj) => obj));
	return async (request, unwrapper = asIs) => {
		requestNumber += 1;
		const requestId = `${requestNumber}`;
		const finalRequest = await prepareRequest(requestId)(buildRequest(request, settings));
		try {
			const response = await httpClient(finalRequest);
			const finalResponse = await prepareResponse(requestId)(response);
			return await responseParser(unwrapper, request.responseType ?? "json")(finalResponse);
		} catch (err) {
			return unwrapper(await prepareResponseErrors()(finalRequest, err));
		}
	};
};

//#endregion
//#region node_modules/@scaleway/sdk-client/dist/scw/client.js
/** Default {@link Settings} values. */
var DEFAULT_SETTINGS = {
	apiURL: "https://api.scaleway.com",
	httpClient: fetch,
	interceptors: [],
	userAgent
};
/**
* Creates a Scaleway client with advanced options.
* You can either use existing factories
* (like `withProfile`, `withUserAgentSuffix`, etc)
* or write your own using the interface `ClientConfig`.
*
* @example
* Creates a client with factories:
* ```
* createAdvancedClient(
*   (obj: Settings) => ({
*     ...obj,
*     defaultPageSize: 100 ,
*     httpClient: myFetchWrapper,
*   }),
*   withUserAgentSuffix('bot-name/1.0'),
* )
* ```
*
* @throws Error
* Thrown if the setup fails.
*
* @public
*/
var createAdvancedClient = (...configs) => {
	const settings = configs.concat([withLegacyInterceptors()]).reduce((currentSettings, config) => config(currentSettings), DEFAULT_SETTINGS);
	assertValidSettings(settings);
	getLogger().info(`init Scaleway SDK version ${version}`);
	return {
		fetch: buildFetcher(settings, settings.httpClient),
		settings
	};
};
/**
* Creates a Scaleway client with a profile.
*
* @example
* Creates a client with credentials & default values (see https://www.scaleway.com/en/docs/identity-and-access-management/iam/how-to/create-api-keys/):
* ```
* import { createClient } from '@scaleway/sdk'
*
* createClient({
*   accessKey: 'SCWXXXXXXXXXXXXXXXXX',
*   secretKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
*   defaultProjectId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
*   defaultRegion: 'fr-par',
*   defaultZone: 'fr-par-1',
* })
* ```
*
* @example
* Creates a client by loading values from the environment (see https://www.scaleway.com/en/docs/identity-and-access-management/iam/how-to/create-api-keys/)
* or the config file created by CLI `scw init` (see https://www.scaleway.com/en/cli/):
* ```
* import { loadProfileFromConfigurationFile } from '@scaleway/configuration-loader'
* import { createClient } from '@scaleway/sdk'
*
* createClient({
*   ...await loadProfileFromConfigurationFile(),
*   defaultZone: 'fr-par-3',
* })
* ```
*
* @throws Error
* Thrown if the setup fails.
*
* @public
*/
var createClient = (settings = {}) => createAdvancedClient(withProfile(settings), withAdditionalInterceptors(settings.interceptors ?? []));

//#endregion
//#region src/constants.ts
const ENV = {
	TYPE: "INPUT_TYPE",
	ACCESS_KEY: "INPUT_SCW_ACCESS_KEY",
	CONTAINER_NAMESPACE_ID: "INPUT_SCW_CONTAINERS_NAMESPACE_ID",
	CONTAINER_PORT: "INPUT_SCW_CONTAINER_PORT",
	DNS: "INPUT_SCW_DNS",
	DNS_PREFIX: "INPUT_SCW_DNS_PREFIX",
	REGION: "INPUT_SCW_REGION",
	REGISTRY: "INPUT_SCW_REGISTRY",
	PROJECT_ID: "INPUT_SCW_PROJECT_ID",
	SECRET_KEY: "INPUT_SCW_SECRET_KEY",
	MEMORY_LIMIT: "INPUT_SCW_MEMORY_LIMIT",
	MIN_SCALE: "INPUT_SCW_MIN_SCALE",
	MAX_SCALE: "INPUT_SCW_MAX_SCALE",
	MAX_CONCURRENCY: "INPUT_SCW_MAX_CONCURRENCY",
	CPU_LIMIT: "INPUT_SCW_CPU_LIMIT",
	SANDBOX: "INPUT_SCW_SANDBOX",
	ROOT_ZONE: "INPUT_ROOT_ZONE",
	ENVIRONMENT_VARIABLES: "INPUT_SCW_ENVIRONMENT_VARIABLES",
	SECRETS: "INPUT_SCW_SECRETS"
};
const DEFAULTS = {
	DESCRIPTION: "this container was created automatically by a github-action",
	PORT: 80,
	MIN_SCALE: 1,
	MAX_SCALE: 5,
	MAX_CONCURRENCY: 5,
	MEMORY_LIMIT: 256,
	CPU_LIMIT: 70,
	SANDBOX: "v1",
	TIMEOUT_SECONDS: 60,
	REGION: "fr-par",
	TYPE: "deploy"
};
const DNS = {
	CNAME: "CNAME",
	ALIAS: "ALIAS",
	TTL: 360,
	WAIT_TIMEOUT: 9e5,
	RETRY_INTERVAL: 5e3
};

//#endregion
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
	_actions_core.setOutput(name, value);
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
function parseSecrets() {
	const secretsMap = parseKeyValue(ENV.SECRETS);
	const secrets = [];
	for (const [key, value] of Object.entries(secretsMap)) secrets.push({
		key,
		value
	});
	return secrets;
}

//#endregion
//#region src/container.ts
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
	_actions_core.info("Waiting for namespace to be ready...");
	return await new _scaleway_sdk_container.Containerv1beta1.API(client).waitForNamespace({
		region: namespace.region,
		namespaceId: namespace.id
	});
}
async function waitForContainerReady(client, container) {
	_actions_core.info("Waiting for container to be ready...");
	return await new _scaleway_sdk_container.Containerv1beta1.API(client).waitForContainer({
		region: container.region,
		containerId: container.id
	});
}
async function getContainer(client, region, containerName) {
	const namespaceId = process.env[ENV.CONTAINER_NAMESPACE_ID];
	if (!namespaceId) throw new Error("Namespace ID not found");
	const response = await new _scaleway_sdk_container.Containerv1beta1.API(client).listContainers({
		region,
		namespaceId,
		name: containerName
	});
	if (response.containers.length === 0) return null;
	return response.containers[0];
}
async function deleteContainer(client, region, container) {
	return await new _scaleway_sdk_container.Containerv1beta1.API(client).deleteContainer({
		region,
		containerId: container.id
	});
}
async function getContainersNamespace(client, region) {
	const namespaceId = process.env[ENV.CONTAINER_NAMESPACE_ID];
	if (!namespaceId) throw new Error("Containers namespace ID not found");
	return await new _scaleway_sdk_container.Containerv1beta1.API(client).getNamespace({
		region,
		namespaceId
	});
}
async function isContainerAlreadyCreated(client, namespace, containerName) {
	const response = await new _scaleway_sdk_container.Containerv1beta1.API(client).listContainers({
		region: namespace.region,
		namespaceId: namespace.id,
		name: containerName
	});
	if (response.containers.length === 0) return null;
	return response.containers[0];
}
async function updateDeployedContainer(client, container, pathRegistry) {
	const api = new _scaleway_sdk_container.Containerv1beta1.API(client);
	const containerEnv = getContainerEnvVariables();
	const secrets = parseSecrets();
	const environmentVariables = parseKeyValue(process.env[ENV.ENVIRONMENT_VARIABLES] || "");
	return await api.updateContainer({
		region: container.region,
		containerId: container.id,
		registryImage: pathRegistry,
		redeploy: true,
		environmentVariables,
		secretEnvironmentVariables: secrets,
		memoryLimit: containerEnv.memoryLimit,
		minScale: containerEnv.minScale,
		maxScale: containerEnv.maxScale,
		cpuLimit: containerEnv.cpuLimit,
		port: containerEnv.port,
		maxConcurrency: containerEnv.maxConcurrency,
		sandbox: containerEnv.sandbox
	});
}
async function createContainerAndDeploy(client, namespace, pathRegistry, containerName) {
	const api = new _scaleway_sdk_container.Containerv1beta1.API(client);
	const containerEnv = getContainerEnvVariables();
	const secrets = parseSecrets();
	const environmentVariables = parseKeyValue(process.env[ENV.ENVIRONMENT_VARIABLES] || "");
	const createdContainer = await api.createContainer({
		description: DEFAULTS.DESCRIPTION,
		name: containerName,
		namespaceId: namespace.id,
		region: namespace.region,
		registryImage: pathRegistry,
		timeout: `${DEFAULTS.TIMEOUT_SECONDS}s`,
		environmentVariables,
		secretEnvironmentVariables: secrets,
		memoryLimit: containerEnv.memoryLimit,
		minScale: containerEnv.minScale,
		maxScale: containerEnv.maxScale,
		cpuLimit: containerEnv.cpuLimit,
		port: containerEnv.port,
		maxConcurrency: containerEnv.maxConcurrency,
		sandbox: containerEnv.sandbox
	});
	return await api.deployContainer({
		region: namespace.region,
		containerId: createdContainer.id
	});
}
async function deployContainer(client, namespace, containerName, pathRegistry) {
	_actions_core.info(`Container Name: ${containerName}`);
	const existingContainer = await isContainerAlreadyCreated(client, namespace, containerName);
	if (existingContainer) {
		_actions_core.info("Container already exists and will be updated");
		return await waitForContainerReady(client, await updateDeployedContainer(client, existingContainer, pathRegistry));
	} else return await waitForContainerReady(client, await createContainerAndDeploy(client, namespace, pathRegistry, containerName));
}
async function setCustomDomainContainer(client, container, hostname) {
	if (!hostname) throw new Error("Hostname is required");
	if (hostname.length > 63) throw new Error("Hostname cannot be longer than 63 characters");
	const api = new _scaleway_sdk_container.Containerv1beta1.API(client);
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
//#region src/dns.ts
async function deleteDnsRecord(client, container, dnsZone) {
	_actions_core.info("Update Zone DNS - Delete");
	const prefix = process.env[ENV.DNS_PREFIX] || "";
	const rootZone = process.env[ENV.ROOT_ZONE] || "false";
	const api = new _scaleway_sdk_domain.Domainv2beta1.API(client);
	const data = `${container.domainName}.`;
	let name = container.name;
	let type = DNS.CNAME;
	if (prefix) {
		name = prefix;
		_actions_core.info(`Update With Prefix Zone DNS - Delete: ${prefix}`);
	}
	if (rootZone === "true") {
		name = "";
		type = DNS.ALIAS;
		_actions_core.info("Update Root Zone DNS - Delete");
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
	_actions_core.info("Update Zone DNS - Add");
	const api = new _scaleway_sdk_domain.Domainv2beta1.API(client);
	let name = container.name;
	let type = DNS.CNAME;
	if (prefix) {
		name = prefix;
		_actions_core.info(`Update With Prefix Zone DNS - Add: ${prefix}`);
	}
	let hostname = `${name}.${dnsZone}`;
	if (rootZone === "true") {
		name = "";
		type = DNS.ALIAS;
		hostname = dnsZone;
		_actions_core.info("Update Root Zone DNS - Add");
	}
	const records = [{
		id: "",
		name,
		type,
		ttl: DNS.TTL,
		data: `${container.domainName}.`,
		priority: 0
	}];
	const data = `${container.domainName}.`;
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
	_actions_core.info(`Hostname: ${hostname}`);
	return hostname;
}

//#endregion
//#region src/orchestrator.ts
async function setupDomain(client, container) {
	const dnsName = process.env[ENV.DNS];
	if (!dnsName) return null;
	try {
		const hostname = await setDnsRecord(client, container, dnsName);
		const containerDomain = await setCustomDomainContainer(client, container, hostname);
		_actions_core.info(`ContainerDomain: ${containerDomain.hostname} ${containerDomain.status}`);
		return containerDomain;
	} catch (error) {
		_actions_core.warning(`Unable to setup domain: ${error}`);
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
		_actions_core.warning(`Unable to remove DNS record: ${error}`);
	}
	const deletedContainer = await deleteContainer(client, region, container);
	_actions_core.info(`Container ${deletedContainer.name} deleted`);
	return deletedContainer;
}

//#endregion
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
			_actions_core.setFailed("SCW_REGISTRY is not set");
			return;
		}
		const client = createClientWrapper();
		if (type === "deploy") {
			const result = await deploy(client, region, pathRegistry);
			printOutputs(result.container.domainName, result.domain?.hostname || `https://${result.container.domainName}`, result.container.id, result.container.namespaceId);
		} else if (type === "teardown") {
			const deletedContainer = await teardown(client, region, pathRegistry);
			printOutputs(deletedContainer.domainName, `https://${deletedContainer.domainName}`, deletedContainer.id, deletedContainer.namespaceId);
		} else _actions_core.setFailed(`Unknown type: ${type}. Valid types are: deploy, teardown`);
	} catch (error) {
		_actions_core.setFailed(error instanceof Error ? error.message : "An unknown error occurred");
	}
}
run();

//#endregion
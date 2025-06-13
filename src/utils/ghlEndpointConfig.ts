/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/ghlEndpointConfig.ts
interface EndpointParamConfig {
	name: string;
	type: "string" | "number" | "boolean" | "array";
	required: boolean;
	defaultValue?: any;
	description?: string;
}

interface EndpointConfig {
	locationParam: "locationId" | "location_id" | null; // null if no location needed
	requiresLocation: boolean;
	requiredParams: EndpointParamConfig[];
	optionalParams: EndpointParamConfig[];
	method: "GET" | "POST" | "PUT" | "DELETE";
	description?: string;
}

export const ENDPOINT_CONFIG: Record<string, EndpointConfig> = {
	// CALENDAR ENDPOINTS
	"/calendars": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{
				name: "limit",
				type: "number",
				required: false,
				description: "Number of results to return",
			},
			{
				name: "offset",
				type: "number",
				required: false,
				description: "Number of results to skip",
			},
		],
		method: "GET",
		description: "Get all calendars for a location",
	},

	"/calendars/events": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{
				name: "calendarId",
				type: "string",
				required: false,
				description: "Specific calendar ID",
			},
			{
				name: "startDate",
				type: "string",
				required: false,
				description: "Start date (ISO format)",
			},
			{
				name: "endDate",
				type: "string",
				required: false,
				description: "End date (ISO format)",
			},
			{ name: "limit", type: "number", required: false, defaultValue: 20 },
			{ name: "offset", type: "number", required: false, defaultValue: 0 },
		],
		method: "GET",
		description: "Get calendar events/appointments",
	},

	"/calendars/blocked-slots": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{ name: "calendarId", type: "string", required: false },
			{ name: "startDate", type: "string", required: false },
			{ name: "endDate", type: "string", required: false },
		],
		method: "GET",
		description: "Get blocked time slots",
	},

	// OPPORTUNITIES ENDPOINTS
	"/opportunities/search": {
		locationParam: "location_id",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{ name: "limit", type: "number", required: false, defaultValue: 20 },
			{
				name: "startAfter",
				type: "number",
				required: false,
				description: "Timestamp cursor for pagination (from meta.startAfter)",
			},
			{
				name: "startAfterId",
				type: "string",
				required: false,
				description: "ID cursor for pagination (from meta.startAfterId)",
			},
			{
				name: "pipeline_id",
				type: "string",
				required: false,
				description: "Filter by pipeline",
			},
			{
				name: "pipeline_stage_id",
				type: "string",
				required: false,
				description: "Filter by stage",
			},
			{
				name: "status",
				type: "string",
				required: false,
				description: "Filter by status (open, won, lost, abandoned)",
			},
			{
				name: "assignedTo",
				type: "string",
				required: false,
				description: "Filter by assigned user ID",
			},
			{
				name: "q",
				type: "string",
				required: false,
				description: "Search query",
			},
			{ name: "campaignId", type: "string", required: false },
			{ name: "source", type: "string", required: false },
		],
		method: "GET",
		description: "Search opportunities",
	},

	"/opportunities/pipelines": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [],
		method: "GET",
		description: "Get opportunity pipelines",
	},

	// CONTACTS ENDPOINTS
	"/contacts": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{ name: "limit", type: "number", required: false, defaultValue: 20 },
			{
				name: "startAfter",
				type: "string",
				required: false,
				description: "Pagination cursor",
			},
			{
				name: "query",
				type: "string",
				required: false,
				description: "Search query",
			},
			{
				name: "tags",
				type: "array",
				required: false,
				description: "Filter by tags",
			},
		],
		method: "GET",
		description: "Get contacts",
	},

	"/contacts/search": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{ name: "query", type: "string", required: false },
			{ name: "limit", type: "number", required: false, defaultValue: 20 },
		],
		method: "GET",
		description: "Search contacts",
	},

	// CONVERSATIONS ENDPOINTS
	"/conversations": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{ name: "limit", type: "number", required: false, defaultValue: 20 },
			{
				name: "lastKey",
				type: "string",
				required: false,
				description: "Pagination key",
			},
		],
		method: "GET",
		description: "Get conversations",
	},

	"/conversations/search": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{ name: "query", type: "string", required: false },
			{ name: "limit", type: "number", required: false, defaultValue: 20 },
		],
		method: "GET",
		description: "Search conversations",
	},

	// USER ENDPOINTS
	"/users": {
		locationParam: "locationId",
		requiresLocation: false, // Can work at agency level too
		requiredParams: [],
		optionalParams: [
			{ name: "limit", type: "number", required: false },
			{ name: "skip", type: "number", required: false },
		],
		method: "GET",
		description: "Get users",
	},

	// FORMS & SURVEYS
	"/forms": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{ name: "limit", type: "number", required: false },
			{ name: "skip", type: "number", required: false },
		],
		method: "GET",
		description: "Get forms",
	},

	"/surveys": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [
			{ name: "limit", type: "number", required: false },
			{ name: "skip", type: "number", required: false },
		],
		method: "GET",
		description: "Get surveys",
	},

	// WORKFLOWS
	"/workflows": {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [],
		method: "GET",
		description: "Get workflows",
	},
};

// Helper function to get endpoint config with pattern matching
export function getEndpointConfig(endpoint: string): EndpointConfig {
	// Try exact match first
	if (ENDPOINT_CONFIG[endpoint]) {
		return ENDPOINT_CONFIG[endpoint];
	}

	// Try partial matches for dynamic endpoints
	for (const [pattern, config] of Object.entries(ENDPOINT_CONFIG)) {
		if (endpoint.startsWith(pattern)) {
			return config;
		}
	}

	// Default fallback
	return {
		locationParam: "locationId",
		requiresLocation: true,
		requiredParams: [],
		optionalParams: [],
		method: "GET",
		description: "Unknown endpoint",
	};
}

// Validation helpers
export function validateEndpointParams(
	endpoint: string,
	params: Record<string, any> = {}
): {
	isValid: boolean;
	errors: string[];
	processedParams: Record<string, any>;
} {
	const config = getEndpointConfig(endpoint);
	const errors: string[] = [];
	const processedParams: Record<string, any> = {};

	// Check required parameters
	for (const requiredParam of config.requiredParams) {
		if (
			!(requiredParam.name in params) ||
			params[requiredParam.name] === undefined
		) {
			errors.push(`Missing required parameter: ${requiredParam.name}`);
		} else {
			processedParams[requiredParam.name] = params[requiredParam.name];
		}
	}

	// Process optional parameters and apply defaults
	for (const optionalParam of config.optionalParams) {
		if (
			optionalParam.name in params &&
			params[optionalParam.name] !== undefined
		) {
			processedParams[optionalParam.name] = params[optionalParam.name];
		} else if (optionalParam.defaultValue !== undefined) {
			processedParams[optionalParam.name] = optionalParam.defaultValue;
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		processedParams,
	};
}

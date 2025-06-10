/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/api/authUtils.client.ts
import axios from "axios";

// Constants
export const GHL_BASE_URL =
	process.env.NEXT_PUBLIC_GHL_BASE_URL ||
	"https://services.leadconnectorhq.com";
export const GHL_API_VERSION = "2021-07-28";

/**
 * Generates the authorization URL for GHL OAuth flow
 */
export const getAuthUrl = () => {
	const clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID_V4;
	const redirectUri = process.env.NEXT_PUBLIC_GHL_REDIRECT_URI || "";

	const scope = [
		"businesses.readonly",
		"contacts.readonly",
		"calendars.readonly",
		"calendars/events.readonly",
		"opportunities.readonly",
		"oauth.readonly",
		"locations.readonly",
		"companies.readonly",
		"oauth.write",
		"locations/templates.readonly",
		"locations/tags.write",
		"locations/tags.readonly",
		"locations/tasks.readonly",
		"locations/tasks.write",
		"locations/customFields.write",
		"locations/customFields.readonly",
		"locations/customValues.write",
		"locations/customValues.readonly",
	].join(" ");

	return `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=${scope}&loginWindowOpenMode=self`;
};

/**
 * Exchanges authorization code for access and refresh tokens
 */
export const exchangeCodeForTokens = async (code: string) => {
	try {
		const params = new URLSearchParams();
		params.append("client_id", process.env.NEXT_PUBLIC_GHL_CLIENT_ID_V4 || "");
		params.append("client_secret", process.env.GHL_CLIENT_SECRET_V4 || "");
		params.append("grant_type", "authorization_code");
		params.append("code", code);
		params.append(
			"redirect_uri",
			process.env.NEXT_PUBLIC_GHL_REDIRECT_URI || ""
		);

		const response = await axios.post(
			`${GHL_BASE_URL}/oauth/token`,
			params.toString(),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);
		console.log(response.data);
		return response.data;
	} catch (err) {
		console.error("Error with authorization:", err);

		if (axios.isAxiosError(err) && err.response) {
			console.error("Error response data:", err.response.data);
			console.error("Error response status:", err.response.status);
		}

		throw err;
	}
};

/**
 * Refreshes the access token using a refresh token
 */
export const refreshAccessToken = async (refreshToken: string) => {
	try {
		const params = new URLSearchParams();
		params.append("client_id", process.env.NEXT_PUBLIC_GHL_CLIENT_ID_V4 || "");
		params.append(
			"client_secret",
			process.env.NEXT_PUBLIC_GHL_CLIENT_SECRET || ""
		);
		params.append("grant_type", "refresh_token");
		params.append("refresh_token", refreshToken);

		const response = await axios.post(
			`${GHL_BASE_URL}/oauth/token`,
			params.toString(),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);

		return response.data;
	} catch (err) {
		console.error("Error refreshing token:", err);
		throw err;
	}
};

/**
 * Fetches locations where the app is installed
 */
export const fetchInstalledLocations = async (
	accessToken: string,
	companyId: string
) => {
	try {
		const response = await axios.get(
			`${GHL_BASE_URL}/oauth/installedLocations`,
			{
				params: {
					companyId: companyId,
				},
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/json",
					Version: GHL_API_VERSION,
				},
			}
		);

		return response.data?.locations || [];
	} catch (err) {
		console.error("Error fetching installed locations:", err);
		if (axios.isAxiosError(err) && err.response) {
			console.error("Error response data:", err.response.data);
			console.error("Error response status:", err.response.status);
		}
		throw err;
	}
};

export const getLocationAccessToken = async (
	companyId: string,
	locationId: string,
	accessToken: string
): Promise<string> => {
	try {
		const response = await axios.post(
			`${GHL_BASE_URL}/oauth/locationToken`,
			new URLSearchParams({
				companyId,
				locationId,
			}),
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/x-www-form-urlencoded",
					Version: GHL_API_VERSION,
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		return response.data?.access_token || response.data?.accessToken || "";
	} catch (err) {
		console.error("Error getting location access token:", err);
		if (axios.isAxiosError(err) && err.response) {
			console.error("Error response data:", err.response.data);
			console.error("Error response status:", err.response.status);
			console.error("Error response headers:", err.response.headers);
		}
		throw new Error(
			`Failed to get location access token: ${
				err instanceof Error ? err.message : "Unknown error"
			}`
		);
	}
};

// Location type definition
export interface GHLLocation {
	id?: string;
	locationId?: string;
	name: string;
	[key: string]: any;
}

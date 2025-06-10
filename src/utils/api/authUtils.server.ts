/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/api/authUtils.server.ts
import { cookies } from "next/headers";
import { refreshAccessToken } from "./authUtils.client";

// Location type re-export
export interface GHLLocation {
	id?: string;
	locationId?: string;
	name: string;
	[key: string]: any;
}

/**
 * Retrieves the current auth tokens from cookies
 */
export const getTokens = async () => {
	const cookieStore = await cookies();
	return {
		accessToken: cookieStore.get("ghl_access_token")?.value,
		refreshToken: cookieStore.get("ghl_refresh_token")?.value,
	};
};

/**
 * Gets the company ID from cookies
 */
export const getCompanyId = async () => {
	const cookieStore = await cookies();
	return cookieStore.get("ghl_company_id")?.value;
};

/**
 * Clears all authentication tokens
 */
export const clearAuthTokens = async () => {
	const cookieStore = await cookies();
	cookieStore.delete("ghl_access_token");
	cookieStore.delete("ghl_refresh_token");
	cookieStore.delete("ghl_company_id");
	cookieStore.delete("ghl_location_id");
	cookieStore.delete("ghl_user_id");
};

/**
 * Gets the default location from cookies
 */
export const getDefaultLocation = async () => {
	const cookieStore = await cookies();
	return cookieStore.get("ghl_location_id")?.value;
};

/**
 * Gets all locations from cookies
 */
export const getLocations = async () => {
	const cookieStore = await cookies();
	const locationsStr = cookieStore.get("ghl_locations")?.value;
	if (!locationsStr) return [];

	try {
		return JSON.parse(locationsStr);
	} catch (err) {
		console.error("Error parsing locations from cookie:", err);
		return [];
	}
};

/**
 * Sets tokens in cookies
 */
export const setTokens = async (
	accessToken: string,
	refreshToken: string,
	expiresIn: number,
	companyId?: string,
	locationId?: string,
	userId?: string,
	locationAccessToken?: string
) => {
	const cookieStore = await cookies();

	cookieStore.set("ghl_access_token", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: expiresIn,
		path: "/",
	});

	cookieStore.set("ghl_refresh_token", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 365 * 24 * 60 * 60, // 1 year
		path: "/",
	});

	if (companyId) {
		cookieStore.set("ghl_company_id", companyId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 365 * 24 * 60 * 60, // 1 year
			path: "/",
		});
	}

	if (locationId) {
		cookieStore.set("ghl_location_id", locationId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 365 * 24 * 60 * 60, // 1 year
			path: "/",
		});
	}

	if (userId) {
		cookieStore.set("ghl_user_id", userId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 365 * 24 * 60 * 60, // 1 year
			path: "/",
		});
	}

	if (locationAccessToken) {
		cookieStore.set("ghl_LAT", locationAccessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 365 * 24 * 60 * 60, // 1 year
			path: "/",
		});
	}
};

/**
 * Checks if the user is authenticated (has valid tokens)
 */
export const isAuthenticated = async (): Promise<boolean> => {
	const { accessToken, refreshToken } = await getTokens();
	return Boolean(accessToken && refreshToken);
};

/**
 * Stores installed locations and sets the default location
 */
export const storeInstalledLocations = async (locations: GHLLocation[]) => {
	const cookieStore = await cookies();

	// Only set locations cookie if we have locations
	if (locations && locations.length > 0) {
		cookieStore.set("ghl_locations", JSON.stringify(locations), {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 0.3 * 24 * 60 * 60, // 30 days
			path: "/",
		});

		// Get the ID for the first location, making sure we have a valid string
		const defaultLocationId = locations[0].id || locations[0].locationId;

		// Only set the default location if we have a valid ID
		if (defaultLocationId) {
			cookieStore.set("ghl_default_location", defaultLocationId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 30 * 24 * 60 * 60, // 30 days
				path: "/",
			});
		}
	}
};

/**
 * Sets the default location
 */
export const setDefaultLocation = async (locationId: string): Promise<void> => {
	// Ensure locationId is a non-empty string
	if (!locationId) {
		throw new Error("Location ID is required");
	}

	const cookieStore = await cookies();
	cookieStore.set("ghl_default_location", locationId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 30 * 24 * 60 * 60, // 30 days
		path: "/",
	});
};

/**
 * Manually initiates token refresh and updates cookies
 */
export async function manualTokenRefresh(): Promise<boolean> {
	try {
		const cookieStore = await cookies();
		const refreshTokenValue = cookieStore.get("ghl_refresh_token")?.value;

		if (!refreshTokenValue) {
			return false;
		}

		const tokenData = await refreshAccessToken(refreshTokenValue);

		cookieStore.set("ghl_access_token", tokenData.access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: tokenData.expires_in,
			path: "/",
		});

		if (tokenData.refresh_token) {
			cookieStore.set("ghl_refresh_token", tokenData.refresh_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 365 * 24 * 60 * 60, // 1 year
				path: "/",
			});
		}

		return true;
	} catch (error) {
		console.error("Manual token refresh failed:", error);
		return false;
	}
}

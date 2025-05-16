/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { cookies } from "next/headers";
import {
	GHL_BASE_URL,
	GHL_API_VERSION,
	refreshAccessToken,
} from "./authUtils.client";

interface TokenRefreshResponse {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
}

/**
 * Creates an authenticated Axios client for making GHL API requests
 * with automatic token refresh capability
 * Note: This function uses next/headers and should only be used in server components
 */
export async function createAuthClient(): Promise<AxiosInstance> {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("ghl_access_token")?.value;

	if (!accessToken) {
		throw new Error("No access token available");
	}

	// Create the axios instance with the current access token
	const client = axios.create({
		baseURL: GHL_BASE_URL,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
			Version: GHL_API_VERSION,
		},
	});

	// Add response interceptor to handle token refresh
	client.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const originalRequest = error.config as AxiosRequestConfig & {
				_retry?: boolean;
			};

			// If error is 401 and we haven't already tried to refresh token
			if (error.response?.status === 401 && !originalRequest._retry) {
				originalRequest._retry = true;

				try {
					// Get refresh token from cookies
					const refreshTokenValue = cookieStore.get("ghl_refresh_token")?.value;

					if (!refreshTokenValue) {
						throw new Error("No refresh token available");
					}

					// Get new tokens
					const tokenData: TokenRefreshResponse = await refreshAccessToken(
						refreshTokenValue
					);

					// Update cookies with new tokens
					if (tokenData.access_token) {
						cookieStore.set("ghl_access_token", tokenData.access_token, {
							httpOnly: true,
							secure: process.env.NODE_ENV === "production",
							maxAge: tokenData.expires_in,
							path: "/",
						});
					}

					// If a new refresh token was provided, update it
					if (tokenData.refresh_token) {
						cookieStore.set("ghl_refresh_token", tokenData.refresh_token, {
							httpOnly: true,
							secure: process.env.NODE_ENV === "production",
							maxAge: 365 * 24 * 60 * 60, // 1 year
							path: "/",
						});
					}

					// Update the Authorization header
					if (originalRequest.headers) {
						originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
					} else {
						originalRequest.headers = {
							Authorization: `Bearer ${tokenData.access_token}`,
						};
					}

					// Retry the original request with new token
					return client(originalRequest);
				} catch (refreshError) {
					console.error("Failed to refresh token:", refreshError);

					// Clear all auth cookies if refresh failed
					cookieStore.delete("ghl_access_token");
					cookieStore.delete("ghl_refresh_token");

					// Throw authentication error to trigger redirect to login
					throw new Error("Authentication failed. Please log in again.");
				}
			}

			// For all other errors, just pass through
			return Promise.reject(error);
		}
	);

	return client;
}

/**
 * Creates a GHL API client for a specific location
 * Note: This function uses next/headers and should only be used in server components
 */
export async function createLocationClient(
	locationId: string
): Promise<AxiosInstance> {
	const client = await createAuthClient();

	// Clone the client but set the Location header
	const locationClient = axios.create({
		...client.defaults,
		headers: {
			...client.defaults.headers,
			"Location-Id": locationId,
		},
	});

	// Copy the interceptors from the auth client
	locationClient.interceptors.request = client.interceptors.request;
	locationClient.interceptors.response = client.interceptors.response;

	return locationClient;
}

/**
 * GHL API wrapper for making API requests with proper error handling
 * Note: This function uses next/headers and should only be used in server components
 */
export async function callGhlApi<T>(
	endpoint: string,
	method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
	data?: any,
	locationId?: string,
	params?: Record<string, any>
): Promise<T> {
	try {
		// Get the appropriate client (with or without location header)
		const client = locationId
			? await createLocationClient(locationId)
			: await createAuthClient();

		let response;

		const config = params ? { params } : undefined;

		switch (method) {
			case "GET":
				response = await client.get<T>(endpoint, config);
				break;
			case "POST":
				response = await client.post<T>(endpoint, data, config);
				break;
			case "PUT":
				response = await client.put<T>(endpoint, data, config);
				break;
			case "DELETE":
				response = await client.delete<T>(endpoint, config);
				break;
		}

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError;
			console.error(`GHL API Error (${endpoint}):`, {
				status: axiosError.response?.status,
				statusText: axiosError.response?.statusText,
				data: axiosError.response?.data,
			});

			if (axiosError.response?.status === 401) {
				throw new Error("Authentication failed. Please login again.");
			}
		}

		throw error;
	}
}

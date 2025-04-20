import { cookies } from "next/headers";
import axios from "axios";
import { refreshAccessToken } from "./apiClient";

const GHL_BASE_URL =
	process.env.GHL_BASE_URL || "https://services.leadconnectorhq.com";

const GHL_API_VERSION = "2021-07-28";

export const createServerApiClient = () => {
	const serverClient = axios.create({
		baseURL: GHL_BASE_URL,
		headers: {
			"Content-Type": "application/json",
		},
	});
	// work around to typescript error
	serverClient.defaults.headers.common["Version"] = GHL_API_VERSION;

	serverClient.interceptors.request.use(async (config) => {
		const cookieStore = cookies();
		const accessToken = (await cookieStore).get("ghl_access_token")?.value;

		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}

		return config;
	});

	serverClient.interceptors.response.use(
		(response) => response,
		async (err) => {
			const originalRequest = err.config;

			if (err.response?.status === 401 && !originalRequest._retry) {
				originalRequest._retry = true;

				try {
					const cookieStore = cookies();
					const refreshToken = (await cookieStore).get(
						"ghl_refresh_token"
					)?.value;

					if (!refreshToken) {
						throw new Error("No refresh token available");
					}

					const tokenData = await refreshAccessToken(refreshToken);

					(await cookieStore).set("ghl_access_token", tokenData.access_token, {
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						maxAge: tokenData.expires_in,
						path: "/",
					});

					if (tokenData.refreshToken) {
						(await cookieStore).set(
							"ghl_access_token",
							tokenData.access_token,
							{
								httpOnly: true,
								secure: process.env.NODE_ENV === "production",
								maxAge: 30 * 24 * 60 * 60,
								path: "/",
							}
						);
					}

					originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
					return serverClient(originalRequest);
				} catch (err) {
					return Promise.reject(err);
				}
			}
			return Promise.reject(err);
		}
	);

	return serverClient;
};

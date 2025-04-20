import axios from "axios";
import { cookies } from "next/headers";

const GHL_BASE_URL =
	process.env.GHL_BASE_URL || "https://services.leadconnectorhq.com";

const apiClient = axios.create({
	baseURL: GHL_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export const getAuthUrl = () => {
	const clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID;
	const redirectUri = encodeURIComponent(
		process.env.NEXT_PUBLIC_GHL_REDIRECT_URI || ""
	);
	const scope = encodeURIComponent(
		"businesses.readonly contacts.readonly calendars/events.readonly"
	);

	return `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=${scope}`;
};

export const exchangeCodeForTokens = async (code: string) => {
	try {
		const params = new URLSearchParams();
		params.append("client_id", process.env.NEXT_PUBLIC_GHL_CLIENT_ID || "");
		params.append("client_secret", process.env.GHL_CLIENT_SECRET || "");
		params.append("grant_type", "authorization_code");
		params.append("code", code);
		params.append(
			"redirect_uri",
			process.env.NEXT_PUBLIC_GHL_REDIRECT_URI || ""
		);

		console.log("Token request parameters:", {
			url: `${GHL_BASE_URL}/oauth/token`,
			clientIdProvided: !!process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
			clientSecretProvided: !!process.env.GHL_CLIENT_SECRET,
			redirectUri: process.env.NEXT_PUBLIC_GHL_REDIRECT_URI,
			contentType: "application/x-www-form-urlencoded",
		});

		const response = await axios.post(
			`${GHL_BASE_URL}/oauth/token`,
			params.toString(),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);

		console.log("Token exchange successful");

		return response.data;
	} catch (err) {
		console.error("Error with authorization:", err);

		if (axios.isAxiosError(err) && err.response) {
			console.error("Error response data:", err.response.data);
			console.error("Error response status:", err.response.status);
			console.error("Error response headers:", err.response.headers);
		}

		throw err;
	}
};

export const refreshAccessToken = async (refreshToken: string) => {
	try {
		const response = await axios.post(`${GHL_BASE_URL}/oauth/token`, {
			client_id: process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
			client_secret: process.env.GHL_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		});

		return response.data;
	} catch (err) {
		console.error("Error:", err);
		throw err;
	}
};

export const createServerApiClient = () => {
	const serverClient = axios.create({
		baseURL: GHL_BASE_URL,
		headers: {
			"Content-Type": "application/json",
		},
	});

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

export default apiClient;

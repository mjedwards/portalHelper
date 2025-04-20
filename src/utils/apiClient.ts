import axios from "axios";

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

		// console.log("Token request parameters:", {
		// 	url: `${GHL_BASE_URL}/oauth/token`,
		// 	clientIdProvided: !!process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
		// 	clientSecretProvided: !!process.env.GHL_CLIENT_SECRET,
		// 	redirectUri: process.env.NEXT_PUBLIC_GHL_REDIRECT_URI,
		// 	contentType: "application/x-www-form-urlencoded",
		// });

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
		}

		throw err;
	}
};

export const refreshAccessToken = async (refreshToken: string) => {
	try {
		const params = new URLSearchParams();
		params.append("client_id", process.env.NEXT_PUBLIC_GHL_CLIENT_ID || "");
		params.append("client_secret", process.env.GHL_CLIENT_SECRET || "");
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

export default apiClient;

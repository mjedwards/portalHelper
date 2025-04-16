import axios from "axios";

const GHL_BASE_URL = process.env.GHL_BASE_URL;

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

	return `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=${scope}`;
};

export const exchangeCodeForTokens = async (code: string) => {
	try {
		const response = await axios.post(`${GHL_BASE_URL}/oauth/token`, {
			client_id: process.env.GHL_CLIENT_ID,
			client_secret: process.env.GHL_CLIENT_SECRET,
			grant_type: "authorization_code",
			code,
			redirect_uri: process.env.GHL_REDIRECT_URI,
		});

		return response.data;
	} catch (err) {
		console.error("Error with authorization:", err);
	}
};

export const refreshAccessToken = async (refreshToken: string) => {
	try {
		const response = await axios.post(`${GHL_BASE_URL}/oauth/token`, {
			client_id: process.env.GHL_CLIENT_ID,
			client_secret: process.env.GHL_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		});

		return response.data;
	} catch (err) {
		console.error("Error:", err);
	}
};

export default apiClient;

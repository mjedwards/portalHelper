import { refreshAccessToken } from "./apiClient";
import { cookies } from "next/headers";

export async function handleTokenRefresh() {
    const cookieStore = cookies();
    const refreshToken = (await cookieStore).get('ghl_refresh_token')?.value;

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const tokenData = await refreshAccessToken(refreshToken);

        (await cookieStore).set('ghl_access_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: tokenData.expires_in,
            path: '/',
        });

        if (tokenData.refresh_token) {
            (await cookieStore).set('ghl_access_token', tokenData.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60,
                path: '/',
            });
        }

        return tokenData.access_token
    } catch (err) {
        console.error('Failed to refresh token:', err);
        throw err;
    }
}
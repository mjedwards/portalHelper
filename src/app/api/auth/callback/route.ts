/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import {
	exchangeCodeForTokens,
	fetchInstalledLocations,
	// getLocationAccessToken,
} from "@/utils/api/authUtils.client";
import {
	storeInstalledLocations,
	setTokens,
} from "@/utils/api/authUtils.server";

export async function POST(req: NextRequest) {
	try {
		const { code } = await req.json();

		if (!code) {
			return NextResponse.json(
				{ error: "No authorization code provided" },
				{ status: 400 }
			);
		}

		// Exchange code for tokens
		const tokenData = await exchangeCodeForTokens(code);

		// Extract companyId from the token response
		const { companyId, locationId, userId } = tokenData;

		if (!companyId) {
			console.error("Token response missing companyId:", tokenData);
			return NextResponse.json(
				{ error: "Company ID not found in token response" },
				{ status: 500 }
			);
		}

		// Get location access token
		// const locationAccessToken = await getLocationAccessToken(
		// 	companyId,
		// 	locationId,
		// 	tokenData.access_token
		// );

		// Store tokens including companyId
		await setTokens(
			tokenData.access_token,
			tokenData.refresh_token,
			tokenData.expires_in,
			companyId,
			locationId,
			userId
			// locationAccessToken
		);

		// Fetch and store locations after successful authentication
		try {
			// Use companyId from token response
			const locations = await fetchInstalledLocations(
				tokenData.access_token,
				companyId
			);
			await storeInstalledLocations(locations);
		} catch (locErr) {
			console.error("Failed to fetch locations:", locErr);
			// Continue anyway - consider this non-fatal
		}

		return NextResponse.json({ success: true });
	} catch (err: any) {
		console.error("Token exchange error:", err);

		// Enhanced error logging
		if (err.response) {
			console.error("Error response data:", err.response.data);
			console.error("Error response status:", err.response.status);
		}

		return NextResponse.json(
			{ error: err.message || "Failed to exchange code for token" },
			{ status: 500 }
		);
	}
}

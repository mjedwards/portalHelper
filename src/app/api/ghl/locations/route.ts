/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import {
	exchangeCodeForTokens,
	fetchInstalledLocations,
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

		const tokenData = await exchangeCodeForTokens(code);
		const { companyId, locationId, userId } = tokenData;
		// Store tokens using our consolidated utility function
		await setTokens(
			tokenData.access_token,
			tokenData.refresh_token,
			tokenData.expires_in,
			companyId,
			locationId,
			userId
		);

		// Fetch and store locations after successful authentication
		try {
			const locations = await fetchInstalledLocations(tokenData.access_token, companyId);
			await storeInstalledLocations(locations);
		} catch (locErr: any) {
			console.error("Failed to fetch locations:", locErr);
			// Continue anyway - consider this non-fatal
		}

		return NextResponse.json({ success: true });
	} catch (err: any) {
		console.error("Token exchange error:", err);
		return NextResponse.json(
			{ error: err.message || "Failed to exchange code for token" },
			{ status: 500 }
		);
	}
}

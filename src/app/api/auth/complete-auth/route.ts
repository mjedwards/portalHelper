/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { fetchInstalledLocations } from "@/utils/api/authUtils.client";
import {
	storeInstalledLocations,
	setTokens,
} from "@/utils/api/authUtils.server";
import { GHL_BASE_URL, GHL_API_VERSION } from "@/utils/api/authUtils.client";

export async function POST(req: NextRequest) {
	try {
		const { accessToken, refreshToken, expiresIn } = await req.json();

		if (!accessToken || !refreshToken) {
			return NextResponse.json(
				{ error: "Missing required token information" },
				{ status: 400 }
			);
		}

		// Fetch user info to get company ID
		const userInfoResponse = await axios.get(`${GHL_BASE_URL}/oauth/userinfo`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/json",
				Version: GHL_API_VERSION,
			},
		});

		const userInfo = userInfoResponse.data;
		const companyId = userInfo.companyId; // Adjust field name if needed

		if (!companyId) {
			return NextResponse.json(
				{ error: "Could not retrieve company ID" },
				{ status: 500 }
			);
		}

		// Store tokens with company ID
		await setTokens(accessToken, refreshToken, expiresIn, companyId);

		// Fetch and store locations
		try {
			const locations = await fetchInstalledLocations(accessToken, companyId);
			await storeInstalledLocations(locations);
		} catch (locErr: any) {
			console.error("Failed to fetch locations:", locErr);
			// Continue anyway - consider this non-fatal
		}

		return NextResponse.json({ success: true });
	} catch (err: any) {
		console.error("Authentication completion error:", err);
		return NextResponse.json(
			{ error: err.message || "Failed to complete authentication" },
			{ status: 500 }
		);
	}
}

import { NextResponse } from "next/server";
import { fetchInstalledLocations } from "@/utils/api/authUtils.client";
import {
	getTokens,
	manualTokenRefresh,
	storeInstalledLocations,
	getCompanyId,
} from "@/utils/api/authUtils.server";

export async function GET() {
	try {
		// Get access token and company ID
		const { accessToken, refreshToken } = await getTokens();
		const companyId = await getCompanyId();

		// If no company ID is available, redirect to login
		if (!companyId) {
			console.error("No company ID available");
			return NextResponse.redirect(
				new URL(
					"/login",
					process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
				)
			);
		}

		if (!accessToken && refreshToken) {
			// If we have refresh token but no access token, refresh the token
			await manualTokenRefresh();
			// Get the new access token
			const tokens = await getTokens();

			if (!tokens.accessToken) {
				// If still no access token, redirect to login
				return NextResponse.redirect(
					new URL(
						"/login",
						process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
					)
				);
			}

			// Use the new access token with company ID
			const locations = await fetchInstalledLocations(
				tokens.accessToken,
				companyId
			);
			await storeInstalledLocations(locations);
		} else if (accessToken) {
			// If we have access token, use it to fetch locations with company ID
			const locations = await fetchInstalledLocations(accessToken, companyId);
			await storeInstalledLocations(locations);
		} else {
			// If no tokens at all, redirect to login
			return NextResponse.redirect(
				new URL(
					"/login",
					process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
				)
			);
		}

		// Redirect back to dashboard
		return NextResponse.redirect(
			new URL(
				"/dashboard",
				process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
			)
		);
	} catch (error) {
		console.error("Error refreshing locations:", error);

		// If there's an error, redirect to login
		return NextResponse.redirect(
			new URL(
				"/login",
				process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
			)
		);
	}
}

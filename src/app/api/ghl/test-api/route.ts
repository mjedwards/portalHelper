/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { getDefaultLocation } from "@/utils/api/authUtils.server";
import GhlService from "@/utils/api/ghlService"; // Changed from { GhlService }

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		let locationId = url.searchParams.get("locationId");

		// If no locationId provided, try to get it from the default location
		if (!locationId) {
			const defaultLocation = await getDefaultLocation();
			locationId = defaultLocation ?? null;
			console.log("Using default location:", locationId);
		}

		console.log(locationId, "location id");
		if (!locationId) {
			return NextResponse.json(
				{
					error: "Location ID is required",
					message:
						"Please specify a locationId query parameter or select a location first",
				},
				{ status: 400 }
			);
		}

		// Use the GhlService to fetch business details
		const businessData = await GhlService.getBusinessDetails(locationId);

		return NextResponse.json({
			success: true,
			data: businessData,
		});
	} catch (err: any) {
		console.error("GHL API test error", err.response?.data || err.message);

		// Special handling for scope issues
		if (
			err.response?.data?.message?.includes("scope") ||
			err.response?.data?.error?.includes("scope")
		) {
			return NextResponse.json(
				{
					error: "Authorization scope issue",
					message:
						"The token is not authorized for this scope. Make sure 'businesses.readonly' scope is included in your app configuration.",
					details: err.response?.data,
				},
				{ status: err.response?.status || 403 }
			);
		}

		if (err.response) {
			return NextResponse.json(
				{
					error: `API error: ${err.response.status}`,
					message: err.response.data?.message || "Error unknown",
					details: err.response.data,
				},
				{ status: err.response.status }
			);
		}

		return NextResponse.json(
			{
				error: err.message || "Failed to call GoHighLevel API",
				details: err.response?.data,
			},
			{ status: 500 }
		);
	}
}

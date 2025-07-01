import GhlService from "@/utils/api/ghlService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const locationId = searchParams.get("locationId");

		if (!locationId) {
			return NextResponse.json(
				{ error: "Location ID is required" },
				{ status: 400 }
			);
		}

		const response = await GhlService.getOpportunityPipelines(locationId);

		console.log(`✅ API Route - Successfully fetched stages`);

		return NextResponse.json(response);
	} catch (error) {
		console.error("❌ API Route - Error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch pipeline stages",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

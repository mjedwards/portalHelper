/* eslint-disable @typescript-eslint/no-explicit-any */
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

		// Extract filters from search params
		const filters: any = {};

		if (searchParams.get("limit"))
			filters.limit = parseInt(searchParams.get("limit")!);
		if (searchParams.get("startAfter"))
			filters.startAfter = searchParams.get("startAfter");
		if (searchParams.get("startAfterId"))
			filters.startAfterId = searchParams.get("startAfterId");
		if (searchParams.get("pipelineId"))
			filters.pipelineId = searchParams.get("pipelineId");
		if (searchParams.get("stageId"))
			filters.stageId = searchParams.get("stageId");
		if (searchParams.get("status")) filters.status = searchParams.get("status");
		if (searchParams.get("assignedTo"))
			filters.assignedTo = searchParams.get("assignedTo");
		if (searchParams.get("q")) filters.q = searchParams.get("q");

		console.log(
			`🔄 API Route - Fetching opportunities for location: ${locationId}`,
			filters
		);

		const response = await GhlService.getOpportunities(locationId, filters);

		console.log(
			`✅ API Route - Successfully fetched ${
				response.opportunities?.length || 0
			} opportunities`
		);

		return NextResponse.json(response);
	} catch (error) {
		console.error("❌ API Route - Error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch opportunities",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

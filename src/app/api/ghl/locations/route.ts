import { NextResponse, NextRequest } from "next/server";
import { createServerApiClient } from "@/utils/serverApiClient";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
	try {
		const apiClient = createServerApiClient();

		const response = await apiClient.get(`/oauth/installedLocations`);

		const locations: Location[] = (response.data?.locations || []).map(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(loc: any) => ({
				id: loc.id || loc.locationId,
				name: loc.name,
			})
		);

		return NextResponse.json({
			success: true,
			locations,
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error("Error fetching locations:", err);

		return NextResponse.json(
			{
				error: "Failed to fetch locations",
				message: err.response?.data?.message || err.message,
				details: err.response?.data,
			},
			{ status: err.response?.status || 500 }
		);
	}
}

import { createServerApiClient } from "@/utils/serverApiClient";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const locationId = url.searchParams.get("locationId");

		if (!locationId) {
			return NextResponse.json(
				{
					error: "Location ID is required",
					message: "Please specify a locationId query parameters",
				},
				{ status: 400 }
			);
		}

		const apiClient = createServerApiClient();

		const response = await apiClient.get(
			`https://services.leadconnectorhq.com/businesses/${locationId}`
		);

		return NextResponse.json({
			success: true,
			data: response.data,
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error("GHL API test error", err.response?.data || err.message);

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

import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import apiClient from "@/utils/apiClient";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
	try {
		const cookieStore = await cookies();
		const accessToken = cookieStore.get("ghl_access_token")?.value;

		if (!accessToken) {
			return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
		}

		const response = await apiClient.get(
			"https://services.leadconnectorhq.com/locations/search",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				params: {
					limit: 5,
				},
			}
		);

		return NextResponse.json({
			success: true,
			data: response.data,
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		console.error("GHL API test error", err.response?.data || err.message);

		if (err.response?.status === 401) {
			return NextResponse.json(
				{ error: "Token expired, please re-authenticate" },
				{ status: 401 }
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

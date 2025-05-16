/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { setDefaultLocation } from "@/utils/api/authUtils.server";

export async function POST(req: NextRequest) {
	try {
		const { locationId } = await req.json();

		if (!locationId) {
			return NextResponse.json(
				{ error: "Location ID is required" },
				{ status: 400 }
			);
		}

		await setDefaultLocation(locationId);

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("Error setting default location:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to set default location" },
			{ status: 500 }
		);
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/ghl/company/[companyId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import GhlService from "@/utils/api/ghlService";
import { isAuthenticated } from "@/utils/api/authUtils.server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { companyId: string } }
) {
	try {
		// Check if user is authenticated
		const authenticated = await isAuthenticated();
		if (!authenticated) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Properly handle params for Next.js App Router
		const { companyId } = params;

		if (!companyId) {
			return NextResponse.json(
				{ error: "Company ID is required" },
				{ status: 400 }
			);
		}

		// Fetch company data using GhlService
		const companyData = await GhlService.getCompany(companyId);

		return NextResponse.json({ company: companyData });
	} catch (error: any) {
		console.error("Error fetching company data:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch company data" },
			{ status: 500 }
		);
	}
}

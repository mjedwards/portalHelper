import { ContactDetailType } from "@/app/types/contact-details";
import GhlService from "@/utils/api/ghlService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const contactId = searchParams.get("contactId");
		const detailType = searchParams.get("detailType") as ContactDetailType;

		if (!contactId) {
			return NextResponse.json(
				{ error: "Contact ID is required" },
				{ status: 400 }
			);
		}

		if (
			!detailType ||
			!["tasks", "appointments", "notes"].includes(detailType)
		) {
			return NextResponse.json(
				{ error: "Valid detail type is required (tasks, appointments, notes)" },
				{ status: 400 }
			);
		}

		console.log(
			`🔄 API Route - Fetching ${detailType} for contact: ${contactId}`
		);

		const response = await GhlService.getContactDetails(contactId, detailType);

		// Log the count based on response type
		let count = 0;
		if ("tasks" in response) count = response.tasks.length;
		else if ("events" in response) count = response.events.length;
		else if ("notes" in response) count = response.notes.length;

		console.log(`✅ API Route - Successfully fetched ${count} ${detailType}`);

		return NextResponse.json(response);
	} catch (error) {
		console.error("❌ API Route - Error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch contact details",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

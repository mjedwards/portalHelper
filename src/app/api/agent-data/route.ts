import { CoachingContext } from "@/app/types/upline";
import { NextRequest, NextResponse } from "next/server";


// Mock data - replace with real database/CRM integration
const MOCK_AGENTS: Record<string, CoachingContext> = {
	"agent-123": {
		agent: {
			id: "agent-123",
			name: "Sarah Johnson",
			tonePreference: "tough",
			lastTraining: "Objection Handling - Price Concerns",
			strengths: ["Rapport Building", "Product Knowledge"],
			improvementAreas: ["Closing", "Follow-up Consistency"],
		},
		metrics: {
			placementRate: 12.5, // Below target - will trigger coaching
			chargebacks: 7, // High - will trigger coaching
			dailyDials: 15, // Low activity
			talkTime: 120,
			bookedAppointments: 8,
			closedAppointments: 3,
			missedFollowups: 5,
			netPremium: 15420,
			lastUpdated: new Date(),
		},
		recentSessions: [
			{
				id: "session-1",
				objectionType: "Price Objection",
				agentResponse: "Well, let me see if I can find you a cheaper option...",
				uplineScore: 4,
				feedback:
					"You immediately went to price instead of exploring value. Need to anchor the emotional reasons first.",
				improvements: [
					"Explore consequences before discussing price",
					"Use NEPQ to build value",
				],
				completedAt: new Date(Date.now() - 86400000), // Yesterday
			},
		],
		currentFocus: [
			"Closing Technique",
			"Chargeback Prevention",
			"Activity Level",
		],
	},
};

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const agentId = searchParams.get("id");

		if (!agentId) {
			return NextResponse.json(
				{ error: "Agent ID is required" },
				{ status: 400 }
			);
		}

		const agentContext = MOCK_AGENTS[agentId];

		if (!agentContext) {
			return NextResponse.json({ error: "Agent not found" }, { status: 404 });
		}

		return NextResponse.json(agentContext);
	} catch (error) {
		console.error("Agent Data API Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Update agent metrics - for future CRM integration
export async function POST(request: NextRequest) {
	try {
		const { agentId, metrics } = await request.json();

		if (!agentId || !metrics) {
			return NextResponse.json(
				{ error: "Agent ID and metrics are required" },
				{ status: 400 }
			);
		}

		// In production, update the database
		if (MOCK_AGENTS[agentId]) {
			MOCK_AGENTS[agentId].metrics = {
				...MOCK_AGENTS[agentId].metrics,
				...metrics,
				lastUpdated: new Date(),
			};
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Agent Data Update Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from "next/server";
import { createMessage } from "@/utils/anthropic";
import {
	buildSystemPrompt,
	KPI_TRIGGERED_COACHING,
	OBJECTION_SCENARIOS,
} from "@/utils/uplinePrompts";
import { CoachingContext, UplineMessage } from "@/app/types/upline";


export async function POST(request: NextRequest) {
	try {
		const {
			message,
			type,
			context,
			activeRoleplay,
			conversationHistory,
		}: {
			message: string;
			type: "coaching" | "roleplay" | "motivation" | "training";
			context: CoachingContext;
			activeRoleplay: string | null;
			conversationHistory: UplineMessage[];
		} = await request.json();

		if (!message || !context) {
			return NextResponse.json(
				{ error: "Message and context are required" },
				{ status: 400 }
			);
		}

		// Build the system prompt with agent context
		const systemPrompt = buildSystemPrompt(context);

		// Build the conversation context
		let conversationContext = "";
		if (conversationHistory.length > 0) {
			conversationContext =
				"\n\nRECENT CONVERSATION:\n" +
				conversationHistory
					.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
					.join("\n");
		}

		// Handle different message types
		let enhancedPrompt = message;
		let metadata: any = {};

		switch (type) {
			case "roleplay":
				if (
					activeRoleplay &&
					OBJECTION_SCENARIOS[activeRoleplay.toLowerCase().replace(/ /g, "_")]
				) {
					const scenario =
						OBJECTION_SCENARIOS[
							activeRoleplay.toLowerCase().replace(/ /g, "_")
						];
					enhancedPrompt = `ROLEPLAY MODE - ${scenario.title}

Scenario: ${scenario.setup}
NEPQ Focus: ${scenario.nepqFocus}
Expected Outcome: ${scenario.expectedResponse}

Agent's response: "${message}"

As THE UPLINE, evaluate their response and continue the roleplay as the prospect OR provide coaching feedback if they handled it well. Score their response 1-10 on: emotional connection, objection handling, and commitment frame.`;

					metadata.objectionType = activeRoleplay;
				}
				break;

			case "motivation":
				if (message.toLowerCase().includes("cardone")) {
					enhancedPrompt = `Channel Grant Cardone's energy and mindset. Give ${context.agent.name} a powerful motivational message about massive action and 10X thinking. Reference their current metrics and push them to the next level.`;
				} else if (message.toLowerCase().includes("shawn mike")) {
					enhancedPrompt = `Channel Shawn Mike's direct, no-excuses style. Give ${context.agent.name} a reality check about their performance and what it takes to win. Be blunt but motivating.`;
				} else if (message.toLowerCase().includes("pbd")) {
					enhancedPrompt = `Channel Patrick Bet-David's strategic leadership style. Give ${context.agent.name} a mindset reset focused on long-term thinking and systematic improvement.`;
				}
				break;

			case "training":
				enhancedPrompt = `TRAINING MODE: ${message}

Provide detailed, actionable training on this topic. Use examples, break it down step-by-step, and relate it to ${context.agent.name}'s current performance metrics. End with a specific practice exercise they can do right now.`;
				break;
		}

		// Add KPI-triggered coaching if metrics indicate issues
		const kpiAlerts = checkKPIAlerts(context.metrics);
		if (kpiAlerts.length > 0) {
			enhancedPrompt += `\n\nKPI ALERTS: ${kpiAlerts.join(" ")}`;
		}

		// Send to Claude with full context
		const fullPrompt = enhancedPrompt + conversationContext;

		const response = await createMessage(fullPrompt, systemPrompt);

		// Check if this completed a roleplay (simple heuristic)
		const roleplayComplete =
			activeRoleplay &&
			(response.content.toLowerCase().includes("great job") ||
				response.content.toLowerCase().includes("score:"));

		// Extract score if present (simple regex)
		const scoreMatch = response.content.match(/score:?\s*(\d+)/i);
		if (scoreMatch) {
			metadata.score = parseInt(scoreMatch[1]);
		}

		return NextResponse.json({
			content: response.content,
			metadata,
			roleplayComplete,
			roleplaySession: roleplayComplete
				? {
						id: Date.now().toString(),
						objectionType: activeRoleplay,
						agentResponse: message,
						uplineScore: metadata.score || 0,
						feedback: response.content,
						improvements: extractImprovements(response.content),
						completedAt: new Date(),
				  }
				: null,
		});
	} catch (error) {
		console.error("UPLINE API Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

function checkKPIAlerts(metrics: any): string[] {
	const alerts = [];

	if (metrics.placementRate < 15) {
		alerts.push(KPI_TRIGGERED_COACHING.low_placement(metrics.placementRate));
	}

	if (metrics.chargebacks > 5) {
		alerts.push(KPI_TRIGGERED_COACHING.high_chargebacks(metrics.chargebacks));
	}

	if (metrics.dailyDials < 20) {
		alerts.push(KPI_TRIGGERED_COACHING.low_activity(metrics.dailyDials));
	}

	if (metrics.missedFollowups > 3) {
		alerts.push(
			KPI_TRIGGERED_COACHING.missed_followups(metrics.missedFollowups)
		);
	}

	return alerts;
}

function extractImprovements(feedback: string): string[] {
	// Simple extraction of improvement points
	const improvements = [];
	const lines = feedback.split("\n");

	for (const line of lines) {
		if (
			line.includes("improve") ||
			line.includes("better") ||
			line.includes("work on")
		) {
			improvements.push(line.trim());
		}
	}

	return improvements.slice(0, 3); // Max 3 improvements
}

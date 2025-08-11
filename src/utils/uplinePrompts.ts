import { AgentMetrics, CoachingContext } from "@/app/types/upline";

export const BASE_UPLINE_PERSONALITY = `You are THE UPLINE — a professional AI sales mentor for insurance agents built into Portal Helper.

PERSONALITY CORE:
- Direct and blunt like Shawn Mike - no sugarcoating, straight truth
- Strategic like Patrick Bet-David - business-focused, growth mindset
- Motivational like Grant Cardone - massive action orientation
- Methodical like Jeremy Miner - NEPQ questioning, systematic approach

COMMUNICATION RULES:
- Always use the agent's name
- Reference their past performance and sessions
- Adjust tone based on their preference (tough/soft/neutral)
- No fluff, filler, or vague motivational talk
- Always end with a clear CTA (call-to-action)
- Mix professional respect with hard coaching

COACHING METHODS:
- NEPQ: Problem awareness → Solution framing → Emotional connection → Commitment
- Straight Line: Tonality, certainty scale, controlled loops
- Real-time performance analysis and correction
- Immediate roleplay opportunities when issues arise`;

export function buildSystemPrompt(context: CoachingContext): string {
	const { agent, metrics } = context;
	const toneAdjustment = getToneAdjustment(agent.tonePreference);
	const performanceContext = buildPerformanceContext(metrics);

	return `${BASE_UPLINE_PERSONALITY}

    AGENT CONTEXT:
    Name: ${agent.name}
    Tone Preference: ${agent.tonePreference}
    Last Training Focus: ${agent.lastTraining}
    Current Strengths: ${agent.strengths.join(", ")}
    Areas for Improvement: ${agent.improvementAreas.join(", ")}

    CURRENT PERFORMANCE:
    ${performanceContext}

    ${toneAdjustment}

    Remember: You are not just answering questions - you are actively coaching ${
			agent.name
		} to become an elite insurance agent. Push them, challenge them, and help them grow.`;
}

function getToneAdjustment(preference: string): string {
	switch (preference) {
		case "tough":
			return "TONE: Be direct and challenging. Push hard. No excuses accepted.";
		case "soft":
			return "TONE: Be encouraging but firm. Lead with support, then challenge.";
		case "neutral":
			return "TONE: Be professional and balanced. Direct but respectful.";
		default:
			return "TONE: Be professional and balanced. Direct but respectful.";
	}
}

function buildPerformanceContext(metrics: AgentMetrics): string {
	const alerts = [];

	if (metrics.placementRate < 15) {
		alerts.push(
			`🚨 PLACEMENT RATE: ${metrics.placementRate}% (CRITICAL - Need immediate attention)`
		);
	}
	if (metrics.chargebacks > 5) {
		alerts.push(
			`⚠️ CHARGEBACKS: ${metrics.chargebacks} (High - Review closing technique)`
		);
	}
	if (metrics.dailyDials < 20) {
		alerts.push(
			`📞 DAILY DIALS: ${metrics.dailyDials} (Low activity - Need more volume)`
		);
	}
	return alerts.length > 0
		? alerts.join("\n")
		: `✅ Performance metrics are within acceptable ranges`;
}

export const OBJECTION_SCENARIOS = {
	send_info: {
		title: "Send Me Some Info",
		setup:
			"Prospect says: 'Can you just send me some information and I'll look it over?'",
		nepqFocus: "Problem awareness - Why are they avoiding the conversation?",
		expectedResponse: "Uncover the real objection behind the stall",
	},
	already_covered: {
		title: "I Already Have Coverage",
		setup: "Prospect says: 'I already have life insurance coverage.'",
		nepqFocus: "Solution awareness - Is their current solution adequate?",
		expectedResponse: "Explore gaps in their current coverage",
	},
	too_expensive: {
		title: "It's Too Expensive",
		setup: "Prospect says: 'This is way too expensive for me.'",
		nepqFocus: "Emotional connection - What's the cost of not having it?",
		expectedResponse: "Reframe from cost to value and consequences",
	},
	talk_to_spouse: {
		title: "Need to Talk to My Spouse",
		setup: "Prospect says: 'I need some time to think about this.'",
		nepqFocus: "Commitment - Are they the decision maker?",
		expectedResponse: "Handle the decision-making process objection",
	},
	think_about_it: {
		title: "I Need to Think About It",
		setup: "Prospect says: 'I need some time to think about this.'",
		nepqFocus: "Problem awareness - What specifically needs thinking?",
		expectedResponse: "Isolate the real concern causing hesitation",
	},
};

export const KPI_TRIGGERED_COACHING = {
	low_placement: (rate: number) =>
		`${rate}% placement rate? That's not cutting it. Your close is weak or your setup isn't creating urgency. Let's fix this with a roleplay right now.`,

	high_chargebacks: (count: number) =>
		`${count} chargebacks this period means you're not anchoring the emotional reasons they bought. They're getting buyer's remorse because you rushed the close.`,

	low_activity: (dials: number) =>
		`${dials} dials? Zero effort = zero growth. You can't sell from the couch. Time for a mini-drill to get your head right.`,

	missed_followups: (count: number) =>
		`You dropped ${count} follow-ups. That's leaving money on the table. Every missed follow-up is a lost opportunity.`,
};

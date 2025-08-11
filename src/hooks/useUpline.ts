import { useState, useCallback, useEffect } from "react";
import {
	UplineMessage,
	CoachingContext,
	RoleplaySession,
} from "@/app/types/upline";

interface UseUploneOptions {
	agentId: string;
	onRoleplayComplete?: (session: RoleplaySession) => void;
	onCoachingInsight?: (insight: string) => void;
}

export function useUpline(options: UseUploneOptions) {
	const [messages, setMessages] = useState<UplineMessage[]>([]);
	const [isCoaching, setIsCoaching] = useState(false);
	const [currentContext, setCurrentContext] = useState<CoachingContext | null>(
		null
	);
	const [activeRoleplay, setActiveRoleplay] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadAgentContext();
	}, [options.agentId]);

	const loadAgentContext = useCallback(async () => {
		try {
			const response = await fetch(`/api/agent-data?id=${options.agentId}`);
			if (!response.ok) throw new Error("Failed to load agent context");

			const context: CoachingContext = await response.json();
			setCurrentContext(context);

			const welcomeMessage: UplineMessage = {
				id: Date.now().toString(),
				role: "upline",
				content: generateWelocomeMessage(context),
				type: "coaching",
				timestamp: new Date(),
			};

			setMessages([welcomeMessage]);
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Failed to initialize THE UPLINE"
			);
		}
	}, [options.agentId]);

	const sendMessage = useCallback(
		async (content: string, type: UplineMessage["type"] = "coaching") => {
			if (!currentContext) {
				setError("Agent context not loaded");
				return;
			}

			const userMessage: UplineMessage = {
				id: Date.now().toString(),
				role: "user",
				content,
				type,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);
			setIsCoaching(true);
			setError(null);

			try {
				const response = await fetch("/api/upline", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						message: content,
						type,
						context: currentContext,
						activeRoleplay,
						conversationHistory: messages.slice(-10),
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to get coaching response");
				}

				const data = await response.json();

				const uplineMessage: UplineMessage = {
					id: (Date.now() + 1).toString(),
					role: "upline",
					content: data.content,
					type,
					timestamp: new Date(),
					metadata: data.metadata,
				};

				setMessages((prev) => [...prev, uplineMessage]);

				if (data.insight && options.onCoachingInsight) {
					options.onCoachingInsight(data.insight);
				}
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "Failed to send message"
				);
			} finally {
				setIsCoaching(false);
			}
		},
		[currentContext, activeRoleplay, messages, options]
	);

	const startRoleplay = useCallback(
		(objectionType: string) => {
			setActiveRoleplay(objectionType);
			sendMessage(
				`Let's run: "${objectionType}". Drill me using NEPQ until I get them emotional.`,
				"roleplay"
			);
		},
		[sendMessage]
	);

	const requestCoaching = useCallback(
		(topic: string) => {
			sendMessage(`Give me coaching on: ${topic}`, "coaching");
		},
		[sendMessage]
	);

	const getMotivation = useCallback(
		(style: "cardone" | "shawn_mike" | "pbd" = "cardone") => {
			const prompts = {
				cardone: "Give me a Grant Cardone motivation boost",
				shawn_mike: "What would Shawn Mike say about my performance?",
				pbd: "I need a Patrick Bet-David mindset reset",
			};
			sendMessage(prompts[style], "motivation");
		},
		[sendMessage]
	);

	const reset = useCallback(() => {
		setMessages([]);
		setActiveRoleplay(null);
		setError(null);
		loadAgentContext();
	}, [loadAgentContext]);

	return {
		messages,
		isCoaching,
		currentContext,
		activeRoleplay,
		error,
		sendMessage,
		startRoleplay,
		requestCoaching,
		getMotivation,
		reset,
	};
}

function generateWelocomeMessage(context: CoachingContext): string {
	const { agent, metrics } = context;

	if (metrics.placementRate < 15) {
		return `${agent.name}, we need to talk. Your ${metrics.placementRate}% placement rate isn't cutting it. Let's fix your close today.`;
	}
	if (metrics.chargebacks > 5) {
		return `${agent.name}, ${metrics.chargebacks} chargebacks this period? They're canceling because you're not anchoring the emotional reasons. Time to tighten that up.`;
	}

	return `What's up, ${agent.name}? Ready to dominate today? Your placement rate is looking solid at ${metrics.placementRate}%. What do you want to work on?`;
}

import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
	throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

export const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeMessage {
	role: "user" | "assistant";
	content: string;
}

export interface ClaudeResponse {
	content: string;
	usage?: {
		input_tokens: number;
		output_tokens: number;
	};
}

export async function createMessage(
	prompt: string,
	system?: string
): Promise<ClaudeResponse> {
	try {
		const message = await anthropic.messages.create({
			model: "claude-sonnet-4-20250514",
			max_tokens: 1000,
			temperature: 1,
			system: system || "You are a helpful assistant.",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
		});

		const content = message.content[0];
		if (content.type === "text") {
			return {
				content: content.text,
				usage: {
					input_tokens: message.usage.input_tokens,
					output_tokens: message.usage.output_tokens,
				},
			};
		}

		throw new Error("Unexpected response format");
	} catch (error) {
		console.error("Claude API Error:", error);
		throw new Error("Failed to get response from Claude");
	}
}

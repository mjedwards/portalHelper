import { useState } from "react";
import { ClaudeResponse } from "@/utils/anthropic";

interface UseClaudeOptions {
	onSuccess?: (response: ClaudeResponse) => void;
	onError?: (error: string) => void;
}

export function useClaude(options?: UseClaudeOptions) {
	const [isLoading, setIsLoading] = useState(false);
	const [response, setResponse] = useState<ClaudeResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	const sendMessage = async (prompt: string, system?: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/claude", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ prompt, system }),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to get response");
			}

			const data: ClaudeResponse = await res.json();
			setResponse(data);
			options?.onSuccess?.(data);

			return data;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			setError(errorMessage);
			options?.onError?.(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		sendMessage,
		isLoading,
		response,
		error,
		reset: () => {
			setResponse(null);
			setError(null);
		},
	};
}

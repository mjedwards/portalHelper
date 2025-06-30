/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/utils/api/fetcher.ts */

export interface FetcherOptions {
	timeout?: number;
	retries?: number;
	retryDelay?: number;
}

export interface FetcherError extends Error {
	status?: number;
	info?: any;
}

const DEFAULT_OPTIONS: FetcherOptions = {
	timeout: 30000, // 30 seconds
	retries: 3,
	retryDelay: 1000, // 1 second
};

/**
 * Enhanced fetcher with retry logic and better error handling
 */
export const fetcher = async (
	url: string,
	options: FetcherOptions = {}
): Promise<any> => {
	const config = { ...DEFAULT_OPTIONS, ...options };
	let lastError: FetcherError;

	console.log("🔍 Fetcher called for URL:", url);

	for (let attempt = 1; attempt <= config.retries!; attempt++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), config.timeout);

			const response = await fetch(url, {
				signal: controller.signal,
				headers: {
					"Content-Type": "application/json",
				},
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				const error: FetcherError = new Error(
					`HTTP ${response.status}: ${response.statusText}`
				);
				error.status = response.status;
				error.info = errorText;

				// Don't retry on 4xx errors (client errors)
				if (response.status >= 400 && response.status < 500) {
					throw error;
				}

				lastError = error;
				console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);

				if (attempt === config.retries) {
					throw error;
				}

				// Exponential backoff for retries
				await new Promise((resolve) =>
					setTimeout(resolve, config.retryDelay! * Math.pow(2, attempt - 1))
				);
				continue;
			}

			const data = await response.json();
			console.log("✅ Fetcher success for:", url);
			return data;
		} catch (error: any) {
			lastError = error;

			// Don't retry on abort errors or client errors
			if (error.name === "AbortError" || (error.status && error.status < 500)) {
				throw error;
			}

			console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);

			if (attempt === config.retries) {
				throw error;
			}

			await new Promise((resolve) =>
				setTimeout(resolve, config.retryDelay! * Math.pow(2, attempt - 1))
			);
		}
	}

	throw lastError!;
};

/**
 * Fetcher specifically for bulk operations with progress tracking using EventSource
 */
export const bulkFetcher = async (
	baseUrl: string,
	onProgress?: (current: number, total: number, pageCount: number) => void,
	onError?: (error: Error) => void
): Promise<any> => {
	console.log("🔗 BulkFetcher: Input baseUrl:", baseUrl);

	// Ensure we have a proper URL for EventSource
	let url: string;

	try {
		// If baseUrl starts with '/', make it absolute
		if (baseUrl.startsWith("/")) {
			url = new URL(baseUrl, window.location.origin).toString();
		} else if (baseUrl.startsWith("http")) {
			url = baseUrl;
		} else {
			// Relative URL, construct it properly
			url = new URL(baseUrl, window.location.origin).toString();
		}

		console.log("🔗 BulkFetcher: Constructed EventSource URL:", url);

		// Validate the URL has proper query parameters
		const urlObj = new URL(url);
		if (!urlObj.searchParams.has("locationId")) {
			throw new Error("LocationId parameter is missing from URL");
		}
	} catch (urlError) {
		console.error("❌ Failed to construct URL:", urlError);
		const error = new Error(
			`Failed to construct URL: ${
				urlError instanceof Error ? urlError.message : "Invalid URL format"
			}`
		);
		onError?.(error);
		throw error;
	}

	let eventSource: EventSource;

	try {
		eventSource = new EventSource(url);
		console.log("✅ BulkFetcher: EventSource created successfully");
	} catch (eventSourceError) {
		console.error("❌ Failed to create EventSource:", eventSourceError);
		const error = new Error(
			`Failed to create EventSource: ${
				eventSourceError instanceof Error
					? eventSourceError.message
					: "Unknown EventSource error"
			}`
		);
		onError?.(error);
		throw error;
	}

	return new Promise((resolve, reject) => {
		eventSource.onopen = () => {
			console.log("✅ BulkFetcher: EventSource connection opened");
		};

		eventSource.onmessage = (event) => {
			try {
				console.log("📨 BulkFetcher: Received message:", event.data);
				const data = JSON.parse(event.data);

				switch (data.type) {
					case "progress":
						console.log("📊 Progress update:", data.progress);
						onProgress?.(
							data.progress.current,
							data.progress.total,
							data.progress.pageCount
						);
						break;

					case "complete":
						console.log("✅ BulkFetcher: Complete");
						eventSource.close();
						resolve(data.result);
						break;

					case "error":
						console.error("❌ BulkFetcher: Server error:", data.error);
						eventSource.close();
						const error = new Error(data.error);
						onError?.(error);
						reject(error);
						break;

					default:
						console.warn("⚠️ BulkFetcher: Unknown message type:", data.type);
				}
			} catch (parseError) {
				console.error("❌ BulkFetcher: Failed to parse message:", parseError);
				eventSource.close();
				const error = new Error("Failed to parse server response");
				onError?.(error);
				reject(error);
			}
		};

		eventSource.onerror = (errorEvent) => {
			console.error("❌ BulkFetcher: EventSource error:", errorEvent);
			console.error("❌ EventSource readyState:", eventSource.readyState);
			console.error("❌ EventSource url:", eventSource.url);

			eventSource.close();

			// Provide more specific error information
			const error = new Error(
				eventSource.readyState === EventSource.CONNECTING
					? "Failed to connect to server - check if the endpoint exists and is accessible"
					: "Connection to server lost"
			);
			onError?.(error);
			reject(error);
		};
	});
};

/**
 * Alternative bulk fetcher using regular fetch with polling
 * Use this as a fallback when EventSource isn't supported or fails
 */
export const bulkFetcherFallback = async (
	baseUrl: string,
	onProgress?: (current: number, total: number, pageCount: number) => void,
	onError?: (error: Error) => void
): Promise<any> => {
	console.log("🔄 BulkFetcher: Using fallback method");
	console.log("🔗 Original baseUrl:", baseUrl);

	// Extract the base URL and query parameters properly
	const [urlPart, queryPart] = baseUrl.split("?");
	const urlParams = new URLSearchParams(queryPart || "");
	const locationId = urlParams.get("locationId");

	console.log("📋 Extracted params:", { urlPart, queryPart, locationId });

	if (!locationId) {
		throw new Error("LocationId is required for bulk fetch");
	}

	// Use the base URL without query params for POST
	const postUrl = urlPart;

	console.log("📬 POST URL:", postUrl);
	console.log("📦 POST body:", { locationId });

	try {
		const response = await fetch(postUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ locationId }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("❌ Fallback fetch failed:", response.status, errorText);
			throw new Error(
				`HTTP ${response.status}: ${response.statusText} - ${errorText}`
			);
		}

		const result = await response.json();
		console.log("✅ Fallback fetch successful:", result);

		// Since this is a fallback, we don't get real-time progress
		// Simulate progress for better UX
		if (onProgress && result.totalOpportunities) {
			onProgress(result.totalOpportunities, result.totalOpportunities, 1);
		}

		return result;
	} catch (error) {
		console.error("❌ BulkFetcher fallback error:", error);
		onError?.(error as Error);
		throw error;
	}
};

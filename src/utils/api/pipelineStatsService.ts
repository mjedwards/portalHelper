/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* src/utils/api/pipelineStatsService.ts */
import { calculatePipelineStats } from "@/utils/calculations/pipelineCalculations";

interface BulkFetchOptions {
	onProgress?: (current: number, total: number, pageCount: number) => void;
	onError?: (error: Error) => void;
	maxRetries?: number;
	delayBetweenRequests?: number;
}

interface OpportunityFilters {
	pipelineId?: string;
	stageId?: string;
	status?: "open" | "won" | "lost" | "abandoned";
	assignedTo?: string;
	q?: string;
}

/**
 * Specialized service for pipeline statistics with bulk fetching capabilities
 */
export class PipelineStatsService {
	private static readonly BASE_URL = "/api/ghl";
	private static readonly MAX_PAGE_SIZE = 100; // GoHighLevel's maximum
	private static readonly DEFAULT_DELAY = 150; // Rate limiting delay

	/**
	 * Fetch quick pipeline statistics (cached/preview data)
	 */
	static async getQuickStats(locationId: string) {
		const response = await fetch(
			`${this.BASE_URL}/opportunities/getPipelineStats?locationId=${locationId}`
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch quick stats: ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * Fetch all opportunities with proper cursor pagination
	 */
	static async getAllOpportunities(
		locationId: string,
		options: BulkFetchOptions & { filters?: OpportunityFilters } = {}
	) {
		const {
			onProgress,
			onError,
			maxRetries = 3,
			delayBetweenRequests = this.DEFAULT_DELAY,
			filters = {},
		} = options;

		const startTime = Date.now();
		let allOpportunities: any[] = [];
		let hasMore = true;
		let startAfterId: string | undefined;
		let pageCount = 0;
		let totalEstimated = 0;

		console.log(
			`🔄 Starting bulk opportunity fetch for location: ${locationId}`
		);

		try {
			while (hasMore) {
				const params = new URLSearchParams({
					locationId,
					limit: String(this.MAX_PAGE_SIZE),
					...filters,
					...(startAfterId && { startAfterId }),
				});

				let retryCount = 0;
				let pageSuccess = false;
				let lastError: Error | null = null;

				// Retry logic for each page
				while (retryCount <= maxRetries && !pageSuccess) {
					try {
						const response = await fetch(
							`${this.BASE_URL}/opportunities?${params.toString()}`
						);

						if (!response.ok) {
							if (response.status === 429) {
								// Rate limit hit - wait longer
								const waitTime = Math.min(5000 * (retryCount + 1), 30000);
								console.log(`⏳ Rate limited. Waiting ${waitTime}ms...`);
								await this.delay(waitTime);
								retryCount++;
								continue;
							}
							throw new Error(
								`HTTP ${response.status}: ${response.statusText}`
							);
						}

						const data = await response.json();

						if (data.opportunities?.length > 0) {
							allOpportunities.push(...data.opportunities);
							pageCount++;

							// Update totals
							if (data.total > totalEstimated) {
								totalEstimated = data.total;
							}

							// Progress callback
							onProgress?.(
								allOpportunities.length,
								totalEstimated || allOpportunities.length,
								pageCount
							);

							console.log(
								`✅ Page ${pageCount}: ${data.opportunities.length} opportunities (Total: ${allOpportunities.length})`
							);
						}

						// Update pagination cursor
						startAfterId = data.meta?.startAfterId;
						hasMore =
							!!startAfterId &&
							data.opportunities?.length === this.MAX_PAGE_SIZE;

						pageSuccess = true;

						// Rate limiting delay
						if (hasMore && delayBetweenRequests > 0) {
							await this.delay(delayBetweenRequests);
						}
					} catch (error) {
						lastError = error as Error;
						retryCount++;

						console.warn(
							`⚠️ Page ${pageCount + 1} attempt ${retryCount} failed:`,
							error
						);

						if (retryCount <= maxRetries) {
							const backoffDelay = Math.min(
								1000 * Math.pow(2, retryCount - 1),
								30000
							);
							await this.delay(backoffDelay);
						}

						onError?.(lastError);
					}
				}

				if (!pageSuccess) {
					throw lastError || new Error(`Failed to fetch page ${pageCount + 1}`);
				}

				// Progress logging
				if (pageCount % 10 === 0 && pageCount > 0) {
					console.log(
						`📊 Progress: ${allOpportunities.length} opportunities in ${pageCount} pages`
					);
				}
			}

			const duration = Date.now() - startTime;
			console.log(
				`✅ Bulk fetch complete: ${allOpportunities.length} opportunities in ${pageCount} pages (${duration}ms)`
			);

			return {
				opportunities: allOpportunities,
				totalFetched: allOpportunities.length,
				totalEstimated: totalEstimated || allOpportunities.length,
				pageCount,
				duration,
			};
		} catch (error) {
			console.error(`❌ Bulk fetch failed:`, error);

			// Return partial results if we have some data
			if (allOpportunities.length > 0) {
				console.log(
					`📊 Returning partial results: ${allOpportunities.length} opportunities`
				);
				return {
					opportunities: allOpportunities,
					totalFetched: allOpportunities.length,
					totalEstimated: totalEstimated || allOpportunities.length,
					pageCount,
					duration: Date.now() - startTime,
					partial: true,
				};
			}

			throw error;
		}
	}

	/**
	 * Get complete pipeline statistics using bulk data
	 */
	static async getCompleteStats(
		locationId: string,
		options: BulkFetchOptions = {}
	) {
		try {
			// Get pipeline configuration
			const pipelinesResponse = await fetch(
				`${this.BASE_URL}/opportunities/getPipelines?locationId=${locationId}`
			);

			if (!pipelinesResponse.ok) {
				throw new Error("Failed to fetch pipeline configuration");
			}

			const { pipelines } = await pipelinesResponse.json();

			// Get all opportunities
			const { opportunities, totalFetched, pageCount, duration } =
				await this.getAllOpportunities(locationId, options);

			// Calculate complete statistics
			const stats = calculatePipelineStats(pipelines, opportunities);

			return {
				...stats,
				meta: {
					mode: "full" as const,
					totalFetched,
					estimatedTotal: totalFetched,
					complete: true,
					lastUpdated: new Date().toISOString(),
					pageCount,
					duration,
				},
			};
		} catch (error) {
			console.error("❌ Failed to get complete pipeline statistics:", error);
			throw error;
		}
	}

	/**
	 * Helper method for delays with proper typing
	 */
	private static delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

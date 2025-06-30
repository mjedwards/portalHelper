/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { PipelineStatsResponse } from "@/app/(auth)/dashboard/components/dashboard/types/pipeline-stats";
import {
	ContactDetailsResponse,
	ContactDetailType,
	ContactEvent,
	ContactNote,
	ContactTask,
	isEventsResponse,
	isNotesResponse,
	isTasksResponse,
} from "@/app/types/contact-details";
import { Contact, Opportunity } from "@/app/types/ghl";
import {
	PipelineOption,
	PipelinesResponse,
	StageOption,
} from "@/app/types/pipeline";

// Enhanced interfaces for bulk operations
interface BulkOpportunityOptions {
	onProgress?: (current: number, total: number, pageCount: number) => void;
	onError?: (error: Error, pageCount: number) => void;
	maxRetries?: number;
	delayBetweenRequests?: number;
	filters?: {
		pipelineId?: string;
		stageId?: string;
		status?: "open" | "won" | "lost" | "abandoned";
		assignedTo?: string;
		q?: string;
	};
}

interface BulkOpportunityResponse {
	opportunities: Opportunity[];
	totalFetched: number;
	totalEstimated: number;
	pageCount: number;
	duration: number;
	fromCache?: boolean;
}

interface PipelineStatsMeta {
	mode: "quick" | "full";
	totalFetched: number;
	estimatedTotal: number;
	complete: boolean;
	lastUpdated: string;
	pageCount?: number;
	duration?: number;
}

export class GhlClientService {
	private static async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const response = await fetch(endpoint, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		});

		const data = await response.json();

		if (!response.ok) {
			if (response.status === 401 && data.needsReauth) {
				window.location.href = "/login";
				throw new Error("Authentication required");
			}
			throw new Error(
				data.error || `HTTP ${response.status}: ${response.statusText}`
			);
		}

		return data;
	}

	// EXISTING OPPORTUNITY METHODS (keep as-is)
	static async getOpportunities(
		locationId: string,
		filters?: {
			limit?: number;
			startAfter?: string;
			startAfterId?: string;
			pipelineId?: string;
			stageId?: string;
			status?: "open" | "won" | "lost" | "abandoned";
			assignedTo?: string;
			q?: string;
		}
	): Promise<{
		opportunities: Opportunity[];
		total?: number;
		count?: number;
		meta?: any;
	}> {
		const searchParams = new URLSearchParams({ locationId });

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					searchParams.append(key, String(value));
				}
			});
		}

		return this.makeRequest<{
			opportunities: Opportunity[];
			total?: number;
			count?: number;
			meta?: any;
		}>(`/api/ghl/opportunities?${searchParams.toString()}`);
	}

	static async getPipelineStages(
		locationId: string
	): Promise<PipelinesResponse> {
		const searchParams = new URLSearchParams({ locationId });

		return this.makeRequest<PipelinesResponse>(
			`/api/ghl/opportunities/getPipelines?${searchParams.toString()}`
		);
	}

	static async getPipelineStatistics(
		locationId: string
	): Promise<PipelineStatsResponse> {
		const searchParams = new URLSearchParams({ locationId });

		return this.makeRequest<PipelineStatsResponse>(
			`/api/ghl/opportunities/getPipelineStats?${searchParams.toString()}`
		);
	}

	// NEW: Bulk fetch all opportunities with pagination handling
	static async getAllOpportunities(
		locationId: string,
		options: BulkOpportunityOptions = {}
	): Promise<BulkOpportunityResponse> {
		const {
			onProgress,
			onError,
			maxRetries = 3,
			delayBetweenRequests = 150,
			filters = {},
		} = options;

		const startTime = Date.now();
		let allOpportunities: Opportunity[] = [];
		let hasMore = true;
		let startAfterId: string | undefined;
		let startAfter: string | undefined;
		let pageCount = 0;
		let totalEstimated = 0;

		console.log(
			`🔄 Starting bulk opportunity fetch for location: ${locationId}`
		);

		try {
			while (hasMore) {
				let retryCount = 0;
				let success = false;
				let lastError: Error | null = null;

				while (retryCount <= maxRetries && !success) {
					try {
						// Prepare pagination parameters
						const paginationParams = {
							limit: 100, // Maximum allowed by GoHighLevel
							...filters,
							...(startAfterId && { startAfterId }),
							...(startAfter && { startAfter }),
						};

						console.log(
							`📄 Fetching page ${pageCount + 1}${
								startAfterId
									? ` (cursor: ${startAfterId.substring(0, 8)}...)`
									: ""
							}`
						);

						// Use your existing method
						const response = await this.getOpportunities(
							locationId,
							paginationParams
						);

						if (response.opportunities && response.opportunities.length > 0) {
							allOpportunities.push(...response.opportunities);
							pageCount++;

							// Update estimated total
							if (response.total && response.total > totalEstimated) {
								totalEstimated = response.total;
							} else if (!totalEstimated && response.count) {
								totalEstimated = response.count;
							}

							// Progress callback
							if (onProgress) {
								onProgress(
									allOpportunities.length,
									totalEstimated || allOpportunities.length,
									pageCount
								);
							}

							console.log(
								`✅ Page ${pageCount} fetched: ${response.opportunities.length} opportunities (Total: ${allOpportunities.length})`
							);
						}

						// Update pagination cursors
						startAfterId = response.meta?.startAfterId;
						startAfter = response.meta?.startAfter;

						// Determine if there are more pages
						hasMore = !!(startAfterId || startAfter);

						// If no pagination cursors but we got a full page, try offset-based
						if (!hasMore && response.opportunities.length === 100) {
							// Check if there might be more data using offset
							const offsetResponse = await this.getOpportunities(locationId, {
								...filters,
								limit: 1,
								startAfter: undefined,
								startAfterId: undefined,
							});

							// If the total is larger than what we have, continue with offset
							if (
								offsetResponse.total &&
								offsetResponse.total > allOpportunities.length
							) {
								hasMore = true;
								// Reset cursors and use offset-based pagination
								startAfterId = undefined;
								startAfter = undefined;
							}
						}

						success = true;

						// Rate limiting: Wait between requests
						if (hasMore && delayBetweenRequests > 0) {
							await new Promise((resolve) =>
								setTimeout(resolve, delayBetweenRequests)
							);
						}
					} catch (error: any) {
						lastError = error as Error;
						retryCount++;

						console.warn(
							`⚠️ Page ${pageCount + 1} attempt ${retryCount} failed:`,
							error
						);

						// Handle rate limiting (429 errors)
						if (
							error &&
							typeof error === "object" &&
							"message" in error &&
							(error.message.includes("429") ||
								error.message.includes("rate limit"))
						) {
							const waitTime = Math.min(5000 * retryCount, 30000);
							console.log(
								`⏳ Rate limited. Waiting ${waitTime}ms before retry...`
							);
							await new Promise((resolve) => setTimeout(resolve, waitTime));
							continue;
						}

						// Exponential backoff for other errors
						if (retryCount <= maxRetries) {
							const backoffDelay = Math.min(
								1000 * Math.pow(2, retryCount - 1),
								30000
							);
							console.log(
								`⏳ Retrying in ${backoffDelay}ms... (attempt ${retryCount}/${maxRetries})`
							);
							await new Promise((resolve) => setTimeout(resolve, backoffDelay));
						}

						// Call error callback
						if (onError) {
							onError(lastError, pageCount);
						}
					}
				}

				// If we exhausted retries, break the loop
				if (!success) {
					console.error(
						`❌ Failed to fetch page ${
							pageCount + 1
						} after ${maxRetries} retries`
					);
					if (lastError) {
						throw lastError;
					}
					break;
				}

				// Progress logging every 10 pages
				if (pageCount % 10 === 0 && pageCount > 0) {
					console.log(
						`📊 Progress update: ${allOpportunities.length} opportunities fetched in ${pageCount} pages`
					);
				}
			}

			const duration = Date.now() - startTime;
			const finalTotal = totalEstimated || allOpportunities.length;

			console.log(
				`✅ Bulk fetch complete: ${allOpportunities.length} opportunities in ${pageCount} pages (${duration}ms)`
			);

			return {
				opportunities: allOpportunities,
				totalFetched: allOpportunities.length,
				totalEstimated: finalTotal,
				pageCount,
				duration,
			};
		} catch (error) {
			const duration = Date.now() - startTime;
			console.error(
				`❌ Bulk fetch failed after ${pageCount} pages (${duration}ms):`,
				error
			);

			// Return partial results if we got some data
			if (allOpportunities.length > 0) {
				console.log(
					`📊 Returning partial results: ${allOpportunities.length} opportunities`
				);
				return {
					opportunities: allOpportunities,
					totalFetched: allOpportunities.length,
					totalEstimated: totalEstimated || allOpportunities.length,
					pageCount,
					duration,
				};
			}

			throw error;
		}
	}

	// NEW: Stream-based bulk fetch using Server-Sent Events
	static async getAllOpportunitiesStreamed(
		locationId: string,
		options: {
			onProgress?: (current: number, total: number, pageCount: number) => void;
			onPartialData?: (stats: any) => void;
			onComplete?: (stats: any) => void;
			onError?: (error: Error) => void;
		} = {}
	): Promise<() => void> {
		const { onProgress, onPartialData, onComplete, onError } = options;

		// Check if browser supports EventSource
		if (typeof window === "undefined" || !window.EventSource) {
			throw new Error("Server-Sent Events not supported");
		}

		const eventSource = new EventSource(
			`/api/ghl/opportunities/bulk-fetch?locationId=${locationId}`
		);

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				switch (data.type) {
					case "progress":
						if (onProgress) {
							onProgress(
								data.progress.current,
								data.progress.total,
								data.progress.pageCount
							);
						}
						break;

					case "partial-stats":
						if (onPartialData) {
							onPartialData(data.stats);
						}
						break;

					case "complete":
						if (onComplete) {
							onComplete(data.stats);
						}
						eventSource.close();
						break;

					case "error":
						if (onError) {
							onError(new Error(data.error));
						}
						eventSource.close();
						break;
				}
			} catch (parseError) {
				console.error("Failed to parse SSE data:", parseError);
				if (onError) {
					onError(new Error("Failed to parse server response"));
				}
			}
		};

		eventSource.onerror = (error) => {
			console.error("EventSource error:", error);
			if (onError) {
				onError(new Error("Connection to server lost"));
			}
			eventSource.close();
		};

		// Return cleanup function
		return () => {
			eventSource.close();
		};
	}

	// NEW: Enhanced pipeline statistics using complete dataset
	static async getPipelineStatisticsComplete(
		locationId: string,
		options?: {
			onProgress?: (current: number, total: number) => void;
			useStreaming?: boolean;
		}
	): Promise<PipelineStatsResponse & { meta: PipelineStatsMeta }> {
		const { onProgress, useStreaming = false } = options || {};

		try {
			console.log("🚀 Starting complete pipeline statistics fetch...");

			if (useStreaming && typeof window !== "undefined" && window.EventSource) {
				// Use streaming endpoint if available
				return new Promise(async (resolve, reject) => {
					let finalStats: any = null;

					const cleanup = await this.getAllOpportunitiesStreamed(locationId, {
						onProgress: onProgress
							? (current, total) => {
									onProgress(current, total);
							  }
							: undefined,
						onComplete: (stats) => {
							resolve({
								...stats,
								meta: {
									mode: "full" as const,
									totalFetched: stats.totalOpportunities || 0,
									estimatedTotal: stats.totalOpportunities || 0,
									complete: true,
									lastUpdated: new Date().toISOString(),
									pageCount: Math.ceil((stats.totalOpportunities || 0) / 100),
									duration: 0, // Will be calculated by server
								},
							});
						},
						onError: (error) => {
							reject(error);
						},
					});

					// Cleanup on reject
					const originalReject = reject;
					reject = (error) => {
						cleanup();
						originalReject(error);
					};
				});
			} else {
				// Fallback to regular bulk fetch
				const { opportunities, totalFetched, pageCount, duration } =
					await this.getAllOpportunities(locationId, {
						onProgress: onProgress
							? (current, total, pages) => {
									onProgress(current, total);
							  }
							: undefined,
					});

				// Get pipelines for calculation
				const pipelinesResponse = await this.getPipelineStages(locationId);

				// Use the pipeline calculation utility (you'll need to import this)
				// For now, let's use a simplified calculation
				const pipelineStats = this.calculatePipelineStatsFromData(
					pipelinesResponse.pipelines,
					opportunities
				);

				return {
					...pipelineStats,
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
			}
		} catch (error) {
			console.error("❌ Complete pipeline statistics fetch failed:", error);
			throw error;
		}
	}

	// NEW: Helper method for calculating pipeline stats from raw data
	private static calculatePipelineStatsFromData(
		pipelines: any[],
		opportunities: Opportunity[]
	): PipelineStatsResponse {
		// This is a simplified version - you should import your utility function
		const pipelineStats = pipelines.map((pipeline) => {
			const pipelineOpportunities = opportunities.filter(
				(opp) => opp.pipelineId === pipeline.id
			);

			const stages = pipeline.stages.map((stage: any) => {
				const stageOpportunities = pipelineOpportunities.filter(
					(opp) => opp.stageId === stage.id
				);

				const totalValue = stageOpportunities.reduce(
					(sum, opp) => sum + (opp.monetaryValue || 0),
					0
				);

				return {
					stageId: stage.id,
					stageName: stage.name,
					position: stage.position,
					opportunityCount: stageOpportunities.length,
					totalValue,
					averageValue:
						stageOpportunities.length > 0
							? totalValue / stageOpportunities.length
							: 0,
					opportunities: stageOpportunities.map((opp) => ({
						id: opp.id,
						name: opp.name,
						monetaryValue: opp.monetaryValue || 0,
						status: opp.status,
						dateAdded: opp.dateAdded,
					})),
				};
			});

			const totalOpportunities = pipelineOpportunities.length;
			const totalValue = pipelineOpportunities.reduce(
				(sum, opp) => sum + (opp.monetaryValue || 0),
				0
			);

			return {
				id: pipeline.id,
				name: pipeline.name,
				totalOpportunities,
				totalValue,
				stages,
			};
		});

		return {
			pipelines: pipelineStats,
			totalOpportunities: opportunities.length,
			totalValue: opportunities.reduce(
				(sum, opp) => sum + (opp.monetaryValue || 0),
				0
			),
		};
	}

	// EXISTING METHODS (keep all as-is)
	static async getAllStages(locationId: string): Promise<StageOption[]> {
		const response = await this.getPipelineStages(locationId);

		const stages: StageOption[] = [];

		response.pipelines.forEach((pipeline) => {
			pipeline.stages.forEach((stage) => {
				stages.push({
					value: stage.id,
					label: stage.name,
					pipelineId: pipeline.id,
					pipelineName: pipeline.name,
					position: stage.position,
				});
			});
		});

		return stages.sort((a, b) => {
			if (a.pipelineName !== b.pipelineName) {
				return a.pipelineName.localeCompare(b.pipelineName);
			}
			return a.position - b.position;
		});
	}

	static async getPipelineOptions(
		locationId: string
	): Promise<PipelineOption[]> {
		const response = await this.getPipelineStages(locationId);

		return response.pipelines.map((pipeline: any) => ({
			value: pipeline.id,
			label: pipeline.name,
			stageCount: pipeline.stages.length,
		}));
	}

	// CONTACT METHODS (keep all as-is)
	static async getContacts(
		locationId: string,
		filters?: {
			limit?: number;
			startAfter?: string;
			query?: string;
			tags?: string[];
		}
	): Promise<{ contacts: Contact[]; meta?: any }> {
		const searchParams = new URLSearchParams({ locationId });

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (key === "tags" && Array.isArray(value)) {
						searchParams.append(key, value.join(","));
					} else {
						searchParams.append(key, String(value));
					}
				}
			});
		}

		return this.makeRequest<{ contacts: Contact[]; meta?: any }>(
			`/api/ghl/contacts?${searchParams.toString()}`
		);
	}

	static async createContact(
		locationId: string,
		contactData: Partial<Contact>
	): Promise<Contact> {
		return this.makeRequest<Contact>(
			`/api/ghl/contacts?locationId=${locationId}`,
			{
				method: "POST",
				body: JSON.stringify(contactData),
			}
		);
	}

	static async getContactDetails<T extends ContactDetailType>(
		contactId: string,
		detailType: T
	): Promise<ContactDetailsResponse> {
		const searchParams = new URLSearchParams({
			contactId,
			detailType,
		});

		return this.makeRequest<ContactDetailsResponse>(
			`/api/ghl/getContactDetails?${searchParams.toString()}`
		);
	}

	// Convenience methods with specific return types
	static async getContactTasks(contactId: string): Promise<ContactTask[]> {
		const response = await this.getContactDetails(contactId, "tasks");
		return isTasksResponse(response) ? response.tasks : [];
	}

	static async getContactAppointments(
		contactId: string
	): Promise<ContactEvent[]> {
		const response = await this.getContactDetails(contactId, "appointments");
		return isEventsResponse(response) ? response.events : [];
	}

	static async getContactNotes(contactId: string): Promise<ContactNote[]> {
		const response = await this.getContactDetails(contactId, "notes");
		return isNotesResponse(response) ? response.notes : [];
	}

	// Add other methods following the same pattern...
	static async getCalendars(locationId: string, filters?: any) {
		// Similar implementation
	}

	static async getCalendarEvents(locationId: string, filters?: any) {
		// Similar implementation
	}

	// CONVENIENCE METHODS (keep as-is)
	static async searchLocationData(
		locationId: string,
		searchTerm: string,
		options?: {
			includeContacts?: boolean;
			includeOpportunities?: boolean;
			limit?: number;
		}
	) {
		const {
			includeContacts = true,
			includeOpportunities = true,
			limit = 20,
		} = options || {};

		const results: {
			contacts?: Contact[];
			opportunities?: Opportunity[];
		} = {};

		try {
			if (includeContacts) {
				const contactsResponse = await this.getContacts(locationId, {
					query: searchTerm,
					limit,
				});
				results.contacts = contactsResponse.contacts;
			}

			if (includeOpportunities) {
				const opportunitiesResponse = await this.getOpportunities(locationId, {
					q: searchTerm,
					limit,
				});
				results.opportunities = opportunitiesResponse.opportunities;
			}

			return results;
		} catch (error) {
			console.error("Search failed:", error);
			throw error;
		}
	}
}

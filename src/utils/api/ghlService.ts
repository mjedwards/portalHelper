/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/enhancedGhlService.ts
import { callGhlApi } from "./ghlClient";
import {
	getEndpointConfig,
	validateEndpointParams,
} from "../ghlEndpointConfig";
import {
	ContactDetailsResponse,
	ContactDetailType,
} from "@/app/types/contact-details";

// Enhanced type interfaces with better specificity
interface Location {
	id: string;
	name: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	postalCode?: string;
	phone?: string;
	email?: string;
	website?: string;
	timezone?: string;
	logoUrl?: string;
	settings?: Record<string, any>;
}

interface Company {
	id: string;
	name: string;
	email?: string;
	logoUrl?: string;
	phone?: string;
	website?: string;
	domain?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	postalCode?: string;
	timezone?: string;
	plan?: number;
	currency?: string;
	customerType?: string;
	billingInfo?: any;
}

interface Contact {
	id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email?: string;
	phone?: string;
	address1?: string;
	city?: string;
	state?: string;
	country?: string;
	postalCode?: string;
	website?: string;
	timezone?: string;
	dnd?: boolean;
	tags?: string[];
	customFields?: Array<{ id: string; value: any }>;
	source?: string;
	dateAdded?: string;
	dateUpdated?: string;
	locationId: string;
}

interface Calendar {
	id: string;
	name: string;
	description?: string;
	isActive?: boolean;
	locationId: string;
	groupId?: string;
	teamMembers?: Array<{
		userId: string;
		priority: number;
		meetingLocations?: any[];
	}>;
	calendarType?: string;
	eventType?: string;
	appoinmentPerSlot?: number;
	appoinmentPerDay?: number;
	openHours?: Array<{
		daysOfTheWeek: number[];
		hours: Array<{
			openHour: number;
			openMinute: number;
			closeHour: number;
			closeMinute: number;
		}>;
	}>;
	enableRecurring?: boolean;
	recurring?: any;
	formId?: string;
	stickyContact?: boolean;
	isLivePaymentMode?: boolean;
	autoConfirm?: boolean;
}

interface CalendarEvent {
	id: string;
	title: string;
	startTime: string; // ISO date string
	endTime: string; // ISO date string
	calendarId: string;
	locationId: string;
	contactId?: string;
	appointmentStatus?:
		| "new"
		| "confirmed"
		| "cancelled"
		| "showed"
		| "noshow"
		| "invalid";
	assignedUserId?: string;
	users?: string[];
	notes?: string;
	address?: string;
	ignoreDateRange?: boolean;
	toNotify?: boolean;
	isRecurring?: boolean;
	rrule?: string;
}

interface Opportunity {
	pipelineStageId: any;
	createdAt: string;
	id: string;
	name: string;
	pipelineId: string;
	stageId: string;
	status: "open" | "won" | "lost" | "abandoned";
	source?: string;
	assignedTo?: string;
	monetaryValue?: number;
	contactId: string;
	locationId: string;
	customFields?: Array<{ id: string; value: any }>;
	followers?: string[];
	tags?: string[];
	dateAdded: string;
	dateUpdated: string;
	lastStatusChangeDate?: string;
	lastStageChangeDate?: string;
}

interface Task {
	id: string;
	title: string;
	body?: string;
	type?: string;
	status?: "incompleted" | "completed";
	contactId: string;
	assignedTo?: string;
	dueDate?: string;
	completed?: boolean;
	dateAdded: string;
	dateUpdated: string;
}

interface PaginationMeta {
	startAfterId?: string;
	startAfter?: string;
	total?: number;
	count?: number;
	hasMore?: boolean;
}

interface GetAllOpportunitiesOptions {
	onProgress?: (current: number, total: number, pageCount: number) => void;
	onError?: (error: Error, pageCount: number) => void;
	maxRetries?: number;
	delayBetweenRequests?: number;
	filters?: {
		pipeline_id?: string;
		pipeline_stage_id?: string;
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

// Enhanced service with parameter validation and endpoint config integration
export const GhlService = {
	// Helper method to validate parameters before making calls
	validateAndCall: async <T>(
		endpoint: string,
		method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
		data?: any,
		locationId?: string,
		params?: Record<string, any>
	): Promise<T> => {
		const config = getEndpointConfig(endpoint);
		const validation = validateEndpointParams(endpoint, params || {});

		if (!validation.isValid) {
			console.warn(
				`Parameter validation warnings for ${endpoint}:`,
				validation.errors
			);
		}

		return callGhlApi<T>(
			endpoint,
			method,
			data,
			locationId,
			validation.processedParams
		);
	},

	// COMPANY ENDPOINTS
	getCompany: async (companyId: string): Promise<Company> => {
		return GhlService.validateAndCall<Company>(
			`/companies/${companyId}`,
			"GET"
		);
	},

	// LOCATION ENDPOINTS
	getLocations: async (): Promise<{ locations: Location[] }> => {
		return GhlService.validateAndCall<{ locations: Location[] }>("/locations/");
	},

	getLocation: async (locationId: string): Promise<Location> => {
		return GhlService.validateAndCall<Location>(
			`/locations/${locationId}`,
			"GET",
			undefined,
			locationId
		);
	},

	// CONTACT ENDPOINTS
	getContacts: async (
		locationId: string,
		filters?: {
			limit?: number;
			startAfter?: string;
			query?: string;
			tags?: string[];
		}
	): Promise<{ contacts: Contact[]; meta?: any }> => {
		return GhlService.validateAndCall<{
			contacts: Contact[];
			meta?: any;
		}>("/contacts/", "GET", undefined, locationId, filters);
	},

	getContact: async (
		locationId: string,
		contactId: string
	): Promise<Contact> => {
		return GhlService.validateAndCall<Contact>(
			`/contacts/${contactId}`,
			"GET",
			undefined,
			locationId
		);
	},

	getContactDetails: async (
		contactId: string,
		detailType: ContactDetailType
	): Promise<ContactDetailsResponse> => {
		return GhlService.validateAndCall<ContactDetailsResponse>(
			`/contacts/${contactId}/${detailType}`,
			"GET",
			undefined,
			undefined
		);
	},

	createContact: async (
		locationId: string,
		contactData: Partial<Contact>
	): Promise<Contact> => {
		return GhlService.validateAndCall<Contact>(
			"/contacts/",
			"POST",
			contactData,
			locationId
		);
	},

	updateContact: async (
		locationId: string,
		contactId: string,
		contactData: Partial<Contact>
	): Promise<Contact> => {
		return GhlService.validateAndCall<Contact>(
			`/contacts/${contactId}`,
			"PUT",
			contactData,
			locationId
		);
	},

	deleteContact: async (
		locationId: string,
		contactId: string
	): Promise<{ success: boolean }> => {
		return GhlService.validateAndCall<{ success: boolean }>(
			`/contacts/${contactId}`,
			"DELETE",
			undefined,
			locationId
		);
	},

	// CALENDAR ENDPOINTS
	getCalendars: async (
		locationId: string,
		filters?: {
			limit?: number;
			offset?: number;
		}
	): Promise<{ calendars: Calendar[] }> => {
		return GhlService.validateAndCall<{ calendars: Calendar[] }>(
			"/calendars/",
			"GET",
			undefined,
			locationId,
			filters
		);
	},

	getCalendar: async (
		locationId: string,
		calendarId: string
	): Promise<Calendar> => {
		return GhlService.validateAndCall<Calendar>(
			`/calendars/${calendarId}`,
			"GET",
			undefined,
			locationId
		);
	},

	// CALENDAR EVENTS ENDPOINTS
	getCalendarEvents: async (
		locationId: string,
		filters?: {
			calendarId?: string;
			startDate?: string; // ISO date string
			endDate?: string; // ISO date string
			limit?: number;
			offset?: number;
		}
	): Promise<{ events: CalendarEvent[]; total?: number }> => {
		return GhlService.validateAndCall<{
			events: CalendarEvent[];
			total?: number;
		}>("/calendars/events", "GET", undefined, locationId, filters);
	},

	getAppointment: async (
		locationId: string,
		appointmentId: string
	): Promise<CalendarEvent> => {
		return GhlService.validateAndCall<CalendarEvent>(
			`/calendars/events/appointments/${appointmentId}`,
			"GET",
			undefined,
			locationId
		);
	},

	// OPPORTUNITY ENDPOINTS
	getOpportunities: async (
		locationId: string,
		filters?: {
			limit?: number;
			offset?: number;
			startAfterId?: string;
			startAfter?: string;
			pipeline_id?: string;
			pipeline_stage_id?: string;
			status?: "open" | "won" | "lost" | "abandoned";
			assignedTo?: string;
			q?: string;
		}
	): Promise<{
		opportunities: Opportunity[];
		total?: number;
		count?: number;
		meta?: PaginationMeta;
	}> => {
		// This will automatically use location_id parameter due to endpoint config
		return GhlService.validateAndCall<{
			opportunities: Opportunity[];
			total?: number;
			count?: number;
		}>("/opportunities/search", "GET", undefined, locationId, filters);
	},
	getAllOpportunities: async (
		locationId: string,
		options: GetAllOpportunitiesOptions = {}
	): Promise<BulkOpportunityResponse> => {
		const {
			onProgress,
			onError,
			maxRetries = 3,
			delayBetweenRequests = 150, // ms between requests for rate limiting
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
						const response = await GhlService.getOpportunities(
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
						// GoHighLevel uses cursor-based pagination
						hasMore = !!(startAfterId || startAfter);

						// If no pagination cursors but we got a full page, try offset-based
						if (!hasMore && response.opportunities.length === 100) {
							// Fallback to offset-based pagination
							const nextResponse = await GhlService.getOpportunities(
								locationId,
								{
									...filters,
									limit: 100,
									offset: allOpportunities.length,
								}
							);

							if (
								nextResponse.opportunities &&
								nextResponse.opportunities.length > 0
							) {
								allOpportunities.push(...nextResponse.opportunities);
								pageCount++;

								if (onProgress) {
									onProgress(
										allOpportunities.length,
										totalEstimated || allOpportunities.length,
										pageCount
									);
								}

								// Continue if we got a full page
								hasMore = nextResponse.opportunities.length === 100;
							} else {
								hasMore = false;
							}
						}

						success = true;

						// Rate limiting: Wait between requests
						if (hasMore && delayBetweenRequests > 0) {
							await new Promise((resolve) =>
								setTimeout(resolve, delayBetweenRequests)
							);
						}
					} catch (error) {
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
							"status" in error &&
							error.status === 429
						) {
							// Fix: error.headers may not exist on type, so use type assertion and optional chaining safely
							const retryAfter =
								typeof (error as any)?.headers?.["retry-after"] !== "undefined"
									? (error as any).headers["retry-after"]
									: 5;
							const waitTime = parseInt(retryAfter as string, 10) * 1000;

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
	},

	getPipelineStatisticsComplete: async (
		locationId: string,
		options?: {
			onProgress?: (current: number, total: number) => void;
			useCache?: boolean;
			cacheMaxAge?: number; // milliseconds
		}
	) => {
		const {
			onProgress,
			useCache = true,
			cacheMaxAge = 5 * 60 * 1000,
		} = options || {};

		try {
			// Get pipelines first (lightweight call)
			const pipelinesResponse = await GhlService.getOpportunityPipelines(
				locationId
			);

			// Get all opportunities with progress tracking
			const { opportunities, totalFetched, pageCount, duration } =
				await GhlService.getAllOpportunities(locationId, {
					onProgress: onProgress
						? (current, total, pages) => {
								onProgress(current, total);
						  }
						: undefined,
				});

			console.log(
				`🔍 Found ${opportunities.length} opportunities for processing`
			);
			console.log(`🔍 Found ${pipelinesResponse.pipelines.length} pipelines`);

			// FIXED: Calculate pipeline statistics using the correct field names
			const pipelineStats = pipelinesResponse.pipelines.map((pipeline) => {
				const pipelineOpportunities = opportunities.filter(
					(opp) => opp.pipelineId === pipeline.id
				);

				console.log(
					`📊 Pipeline "${pipeline.name}": ${pipelineOpportunities.length} opportunities`
				);

				const stages = pipeline.stages.map((stage: any) => {
					// FIXED: Use pipelineStageId instead of stageId
					const stageOpportunities = pipelineOpportunities.filter(
						(opp) => opp.pipelineStageId === stage.id // <-- FIXED: was opp.stageId
					);

					console.log(
						`   Stage "${stage.name}": ${stageOpportunities.length} opportunities`
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
							dateAdded: opp.createdAt || opp.dateAdded, // FIXED: Use createdAt if available
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
					stages: stages.sort((a: any, b: any) => a.position - b.position), // Ensure proper ordering
				};
			});

			const result = {
				pipelines: pipelineStats,
				totalOpportunities: opportunities.length,
				totalValue: opportunities.reduce(
					(sum, opp) => sum + (opp.monetaryValue || 0),
					0
				),
				meta: {
					totalFetched,
					pageCount,
					duration,
					complete: true,
					lastUpdated: new Date().toISOString(),
				},
			};

			console.log("✅ Pipeline statistics calculation complete:", {
				totalOpportunities: result.totalOpportunities,
				totalValue: result.totalValue,
				pipelinesProcessed: result.pipelines.length,
			});

			return result;
		} catch (error) {
			console.error("Failed to get complete pipeline statistics:", error);
			throw error;
		}
	},
	// getPipelineStatisticsComplete: async (
	// 	locationId: string,
	// 	options?: {
	// 		onProgress?: (current: number, total: number) => void;
	// 		useCache?: boolean;
	// 		cacheMaxAge?: number; // milliseconds
	// 	}
	// ) => {
	// 	const {
	// 		onProgress,
	// 		useCache = true,
	// 		cacheMaxAge = 5 * 60 * 1000,
	// 	} = options || {};

	// 	try {
	// 		// Get pipelines first (lightweight call)
	// 		const pipelinesResponse = await GhlService.getOpportunityPipelines(
	// 			locationId
	// 		);

	// 		// Get all opportunities with progress tracking
	// 		const { opportunities, totalFetched, pageCount, duration } =
	// 			await GhlService.getAllOpportunities(locationId, {
	// 				onProgress: onProgress
	// 					? (current, total, pages) => {
	// 							onProgress(current, total);
	// 					  }
	// 					: undefined,
	// 			});

	// 		// Calculate pipeline statistics using the complete dataset
	// 		const pipelineStats = pipelinesResponse.pipelines.map((pipeline) => {
	// 			const pipelineOpportunities = opportunities.filter(
	// 				(opp) => opp.pipelineId === pipeline.id
	// 			);

	// 			const stages = pipeline.stages.map((stage: any) => {
	// 				const stageOpportunities = pipelineOpportunities.filter(
	// 					(opp) => opp.stageId === stage.id
	// 				);

	// 				const totalValue = stageOpportunities.reduce(
	// 					(sum, opp) => sum + (opp.monetaryValue || 0),
	// 					0
	// 				);

	// 				return {
	// 					stageId: stage.id,
	// 					stageName: stage.name,
	// 					position: stage.position,
	// 					opportunityCount: stageOpportunities.length,
	// 					totalValue,
	// 					averageValue:
	// 						stageOpportunities.length > 0
	// 							? totalValue / stageOpportunities.length
	// 							: 0,
	// 					opportunities: stageOpportunities.map((opp) => ({
	// 						id: opp.id,
	// 						name: opp.name,
	// 						monetaryValue: opp.monetaryValue || 0,
	// 						status: opp.status,
	// 						dateAdded: opp.dateAdded,
	// 					})),
	// 				};
	// 			});

	// 			const totalOpportunities = pipelineOpportunities.length;
	// 			const totalValue = pipelineOpportunities.reduce(
	// 				(sum, opp) => sum + (opp.monetaryValue || 0),
	// 				0
	// 			);

	// 			return {
	// 				id: pipeline.id,
	// 				name: pipeline.name,
	// 				totalOpportunities,
	// 				totalValue,
	// 				stages,
	// 			};
	// 		});

	// 		return {
	// 			pipelines: pipelineStats,
	// 			totalOpportunities: opportunities.length,
	// 			totalValue: opportunities.reduce(
	// 				(sum, opp) => sum + (opp.monetaryValue || 0),
	// 				0
	// 			),
	// 			meta: {
	// 				totalFetched,
	// 				pageCount,
	// 				duration,
	// 				complete: true,
	// 				lastUpdated: new Date().toISOString(),
	// 			},
	// 		};
	// 	} catch (error) {
	// 		console.error("Failed to get complete pipeline statistics:", error);
	// 		throw error;
	// 	}
	// },

	getOpportunity: async (
		locationId: string,
		opportunityId: string
	): Promise<Opportunity> => {
		return GhlService.validateAndCall<Opportunity>(
			`/opportunities/${opportunityId}`,
			"GET",
			undefined,
			locationId
		);
	},

	getOpportunityPipelines: async (
		locationId: string
	): Promise<{ pipelines: any[] }> => {
		return GhlService.validateAndCall<{ pipelines: any[] }>(
			"/opportunities/pipelines",
			"GET",
			undefined,
			locationId,
			{ locationId }
		);
	},

	// TASK ENDPOINTS
	getContactTasks: async (
		locationId: string,
		contactId: string
	): Promise<{ tasks: Task[] }> => {
		return GhlService.validateAndCall<{ tasks: Task[] }>(
			`/contacts/${contactId}/tasks`,
			"GET",
			undefined,
			locationId
		);
	},

	getContactTask: async (
		locationId: string,
		contactId: string,
		taskId: string
	): Promise<Task> => {
		return GhlService.validateAndCall<Task>(
			`/contacts/${contactId}/tasks/${taskId}`,
			"GET",
			undefined,
			locationId
		);
	},

	createContactTask: async (
		locationId: string,
		contactId: string,
		taskData: Partial<Task>
	): Promise<Task> => {
		return GhlService.validateAndCall<Task>(
			`/contacts/${contactId}/tasks`,
			"POST",
			taskData,
			locationId
		);
	},

	// BUSINESS ENDPOINTS
	getBusinesses: async (): Promise<any> => {
		return GhlService.validateAndCall<any>(`/businesses`, "GET");
	},

	getBusinessDetails: async (businessId: string): Promise<any> => {
		return GhlService.validateAndCall<any>(
			`/businesses/${businessId}`,
			"GET",
			undefined,
			businessId // Note: businesses might use businessId differently
		);
	},

	// CONVENIENCE METHODS FOR COMMON TASKS

	// Get all appointments for a location (combines calendar events)
	getAllAppointments: async (
		locationId: string,
		dateRange?: { startDate: string; endDate: string }
	): Promise<CalendarEvent[]> => {
		try {
			// First get all calendars
			const calendarsResponse = await GhlService.getCalendars(locationId);
			const calendars = calendarsResponse.calendars || [];

			if (calendars.length === 0) {
				console.warn(`No calendars found for location ${locationId}`);
				return [];
			}

			// Get events for each calendar
			const allEvents: CalendarEvent[] = [];

			for (const calendar of calendars) {
				try {
					const eventsResponse = await GhlService.getCalendarEvents(
						locationId,
						{
							calendarId: calendar.id,
							...dateRange,
							limit: 100,
						}
					);

					if (eventsResponse.events) {
						allEvents.push(...eventsResponse.events);
					}
				} catch (error) {
					console.error(
						`Failed to get events for calendar ${calendar.name}:`,
						error
					);
				}
			}

			return allEvents;
		} catch (error) {
			console.error("Failed to get all appointments:", error);
			throw error;
		}
	},

	// Search across multiple data types
	searchLocationData: async (
		locationId: string,
		searchTerm: string,
		options?: {
			includeContacts?: boolean;
			includeOpportunities?: boolean;
			limit?: number;
		}
	) => {
		const results: {
			contacts?: Contact[];
			opportunities?: Opportunity[];
		} = {};

		const {
			includeContacts = true,
			includeOpportunities = true,
			limit = 20,
		} = options || {};

		try {
			if (includeContacts) {
				const contactsResponse = await GhlService.getContacts(locationId, {
					query: searchTerm,
					limit,
				});
				results.contacts = contactsResponse.contacts;
			}

			if (includeOpportunities) {
				const opportunitiesResponse = await GhlService.getOpportunities(
					locationId,
					{
						q: searchTerm,
						limit,
					}
				);
				results.opportunities = opportunitiesResponse.opportunities;
			}

			return results;
		} catch (error) {
			console.error("Search failed:", error);
			throw error;
		}
	},
};

export default GhlService;

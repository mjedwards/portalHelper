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
	}> => {
		// This will automatically use location_id parameter due to endpoint config
		return GhlService.validateAndCall<{
			opportunities: Opportunity[];
			total?: number;
			count?: number;
		}>("/opportunities/search", "GET", undefined, locationId, filters);
	},

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

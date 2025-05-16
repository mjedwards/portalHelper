/* eslint-disable @typescript-eslint/no-explicit-any */
import { callGhlApi } from "./ghlClient";

// Define type interfaces for API responses
interface Location {
	id: string;
	name: string;
	[key: string]: any;
}

interface Contact {
	id: string;
	[key: string]: any;
}

interface Calendar {
	id: string;
	name: string;
	[key: string]: any;
}

interface Appointment {
	id: string;
	title: string;
	startTime: string;
	endTime: string;
	[key: string]: any;
}

interface Task {
	id: string;
	title: string;
	[key: string]: any;
}

interface Opportunity {
	id: string;
	name: string;
	[key: string]: any;
}

// Note: This service uses callGhlApi which depends on next/headers
// It should only be used in server components
export const GhlService = {
	// Business endpoints
	getBusinessDetails: async (locationId: string) => {
		return callGhlApi<any>(`/businesses/${locationId}`);
	},

	// Location endpoints
	getLocations: async () => {
		return callGhlApi<{ locations: Location[] }>("/locations/");
	},

	getLocation: async (locationId: string) => {
		return callGhlApi<Location>(`/locations/${locationId}`);
	},

	// Contact endpoints
	getContacts: async (locationId: string, params = {}) => {
		return callGhlApi<{ contacts: Contact[] }>(
			"/contacts/",
			"GET",
			undefined,
			locationId,
			params
		);
	},

	getContact: async (locationId: string, contactId: string) => {
		return callGhlApi<Contact>(
			`/contacts/${contactId}`,
			"GET",
			undefined,
			locationId
		);
	},

	createContact: async (locationId: string, contactData: any) => {
		return callGhlApi<Contact>("/contacts/", "POST", contactData, locationId);
	},

	updateContact: async (
		locationId: string,
		contactId: string,
		contactData: any
	) => {
		return callGhlApi<Contact>(
			`/contacts/${contactId}`,
			"PUT",
			contactData,
			locationId
		);
	},

	deleteContact: async (locationId: string, contactId: string) => {
		return callGhlApi<any>(
			`/contacts/${contactId}`,
			"DELETE",
			undefined,
			locationId
		);
	},

	// Calendar endpoints
	getCalendars: async (locationId: string) => {
		return callGhlApi<{ calendars: Calendar[] }>(
			"/calendars/",
			"GET",
			undefined,
			locationId
		);
	},

	getCalendar: async (locationId: string, calendarId: string) => {
		return callGhlApi<Calendar>(
			`/calendars/${calendarId}`,
			"GET",
			undefined,
			locationId
		);
	},

	// Appointment endpoints
	getAppointments: async (locationId: string, params = {}) => {
		return callGhlApi<{ appointments: Appointment[] }>(
			"/calendars/events",
			"GET",
			undefined,
			locationId,
			params
		);
	},

	getAppointment: async (locationId: string, appointmentId: string) => {
		return callGhlApi<Appointment>(
			`/calendars/events/appointments/${appointmentId}`,
			"GET",
			undefined,
			locationId
		);
	},

	// Task endpoints
	getTasks: async (locationId: string, contactId: string) => {
		return callGhlApi<{ tasks: Task[] }>(
			`/contacts/${contactId}/tasks`,
			"GET",
			undefined,
			locationId
		);
	},

	// Opportunity endpoints
	getOpportunities: async (locationId: string, params = {}) => {
		return callGhlApi<{ opportunities: Opportunity[] }>(
			"/opportunities/search",
			"GET",
			undefined,
			locationId,
			params
		);
	},

	getOpportunity: async (locationId: string, opportunityId: string) => {
		return callGhlApi<Opportunity>(
			`/opportunities/${opportunityId}`,
			"GET",
			undefined,
			locationId
		);
	},

	// Add more API methods here as needed
};

export default GhlService;

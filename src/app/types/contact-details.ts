// Individual item interfaces
export interface ContactTask {
	id: string;
	title: string;
	body?: string;
	assignedTo?: string;
	dueDate?: string; // ISO date string
	completed: boolean;
	contactId: string;
	dateAdded?: string;
	dateUpdated?: string;
	type?: string;
	status?: "incompleted" | "completed";
}

export interface ContactEvent {
	id: string;
	calendarId: string;
	status: string;
	title: string;
	appoinmentStatus?: string; // Note: GHL API has typo
	appointmentStatus?:
		| "new"
		| "confirmed"
		| "cancelled"
		| "showed"
		| "noshow"
		| "invalid"
		| "booked";
	assignedUserId?: string;
	notes?: string;
	startTime: string; // Date string
	endTime: string; // Date string
	address?: string;
	locationId: string;
	contactId: string;
	groupId?: string;
	users?: string[];
	dateAdded?: string;
	dateUpdated?: string;
	assignedResources?: string[];
	isRecurring?: boolean;
	rrule?: string;
	toNotify?: boolean;
	ignoreDateRange?: boolean;
}

export interface ContactNote {
	id: string;
	body: string;
	userId: string;
	dateAdded: string; // ISO date string
	contactId: string;
	dateUpdated?: string;
}

// Response type mappings
export interface ContactTasksResponse {
	tasks: ContactTask[];
}

export interface ContactEventsResponse {
	events: ContactEvent[];
}

export interface ContactNotesResponse {
	notes: ContactNote[];
}

// Union type for all possible responses
export type ContactDetailsResponse =
	| ContactTasksResponse
	| ContactEventsResponse
	| ContactNotesResponse;

// Generic interface with discriminated union for type safety
export interface ContactDetailsApiResponse<
	T extends "tasks" | "appointments" | "notes"
> {
	data: T extends "tasks"
		? ContactTasksResponse
		: T extends "appointments"
		? ContactEventsResponse
		: T extends "notes"
		? ContactNotesResponse
		: never;
}

// Helper type to extract the array type from response
export type ContactDetailItem<T extends "tasks" | "appointments" | "notes"> =
	T extends "tasks"
		? ContactTask
		: T extends "appointments"
		? ContactEvent
		: T extends "notes"
		? ContactNote
		: never;

// Type guards for runtime checking
export function isTasksResponse(
	response: ContactDetailsResponse
): response is ContactTasksResponse {
	return "tasks" in response;
}

export function isEventsResponse(
	response: ContactDetailsResponse
): response is ContactEventsResponse {
	return "events" in response;
}

export function isNotesResponse(
	response: ContactDetailsResponse
): response is ContactNotesResponse {
	return "notes" in response;
}

// Utility type for detail type strings
export type ContactDetailType = "tasks" | "appointments" | "notes";

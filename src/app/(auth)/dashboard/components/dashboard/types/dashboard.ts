/* eslint-disable @typescript-eslint/no-explicit-any */
// Contact Interface
export interface Contact {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	companyName?: string | null;
	tags?: string[];
}

// Opportunity Interface
export interface Opportunity {
	id: string;
	name: string;
	monetaryValue: number;
	status: "open" | "won" | "lost" | "abandoned";
	pipelineId: string;
	pipelineStageId: string;
	pipelineStageUId: string;
	assignedTo: string | null;
	source?: string;
	lastStatusChangeAt: string;
	lastStageChangeAt: string;
	createdAt: string;
	updatedAt: string;
	contactId: string;
	locationId: string;
	customFields: any[];
	lostReasonId: string | null;
	followers: any[];
	contact?: Contact;
	relations?: any[];
	sort?: any[];
	attributions?: any[];
}

// Opportunities Meta Information
export interface OpportunitiesMeta {
	total: number;
	currentPage: number;
	nextPage: number | null;
	prevPage: number | null;
	nextPageUrl?: string;
	startAfter?: number;
	startAfterId?: string;
}

// Complete Opportunities Response
export interface OpportunitiesData {
	opportunities: Opportunity[];
	meta: OpportunitiesMeta;
	aggregations?: any;
	traceId?: string;
}

// Calendar Interface
export interface Calendar {
	id: string;
	name: string;
	description?: string;
	isActive?: boolean;
	locationId: string;
	groupId?: string;
	calendarType?: string;
	teamMembers?: Array<{
		userId: string;
		priority: number;
		meetingLocations?: any[];
	}>;
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

// Calendars Response
export interface CalendarsData {
	calendars: Calendar[];
}

// Company Interface
export interface Company {
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

// Dashboard Props Interfaces
export interface DashboardContentProps {
	companyData?: Company;
	opportunitiesData?: OpportunitiesData;
	calendarsData?: CalendarsData;
	locationId: string;
	hasLocationError?: boolean;
}

export interface OpportunitiesCardProps {
	opportunitiesData?: OpportunitiesData;
	onPageChange?: (
		page: number,
		direction: "next" | "prev",
		params?: any
	) => void;
	isLoading?: boolean;
	hasError?: boolean;
}

// Page Change Parameters
export interface PaginationParams {
	startAfter?: number;
	startAfterId?: string;
}

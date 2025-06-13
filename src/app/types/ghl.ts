/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Location {
	id: string;
	name: string;
}

export interface Contact {
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

export interface Opportunity {
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

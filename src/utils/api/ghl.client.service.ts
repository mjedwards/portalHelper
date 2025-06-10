/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

	// OPPORTUNITY METHODS
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
		meta?: any; // Include meta for pagination info
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

	// CONTACT METHODS
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

	// Add other methods following the same pattern...
	static async getCalendars(locationId: string, filters?: any) {
		// Similar implementation
	}

	static async getCalendarEvents(locationId: string, filters?: any) {
		// Similar implementation
	}

	// CONVENIENCE METHODS
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

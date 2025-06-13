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
	
	// Convenience method to get all stages flattened
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

		// Sort by pipeline name, then by stage position
		return stages.sort((a, b) => {
			if (a.pipelineName !== b.pipelineName) {
				return a.pipelineName.localeCompare(b.pipelineName);
			}
			return a.position - b.position;
		});
	}

	// Convenience method to get pipeline options for dropdowns
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

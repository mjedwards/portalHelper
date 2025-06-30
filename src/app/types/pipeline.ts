/* eslint-disable @typescript-eslint/no-explicit-any */

// Individual stage interface (your existing one - keeping as is)
export interface PipelineStage {
	id: string;
	name: string;
	originId?: string; // Optional as not all stages have this
	position: number;
	showInFunnel: boolean;
	showInPieChart: boolean;
}

// Individual pipeline interface (your existing one - keeping as is)
export interface Pipeline {
	id: string;
	name: string;
	originId?: string; // Optional as not all pipelines have this
	dateAdded: string; // ISO date string
	dateUpdated: string; // ISO date string
	stages: PipelineStage[];
	showInFunnel?: boolean; // Optional as not all pipelines have this
	showInPieChart?: boolean; // Optional as not all pipelines have this
}

// Response interface for the API call (your existing one - keeping as is)
export interface PipelinesResponse {
	pipelines: Pipeline[];
	traceId: string;
}

// Utility type for stage selection/filtering (your existing one - keeping as is)
export interface StageOption {
	value: string; // stage id
	label: string; // stage name
	pipelineId: string;
	pipelineName: string;
	position: number;
}

// Utility type for pipeline selection (your existing one - keeping as is)
export interface PipelineOption {
	value: string; // pipeline id
	label: string; // pipeline name
	stageCount: number;
}

// NEW: Opportunity interface (if you don't have this elsewhere)
export interface Opportunity {
	id: string;
	name: string;
	monetaryValue?: number;
	status: string;
	stageId: string;
	pipelineId: string;
	dateAdded?: string;
	dateUpdated?: string;
	contactId?: string;
	assignedTo?: string;
	[key: string]: any; // For additional GHL fields
}

// NEW: Pipeline stage enriched with opportunity data
export interface PipelineStageWithData extends PipelineStage {
	opportunities?: Opportunity[];
	totalValue?: number;
	count?: number;
}

// UPDATED: Pipeline data with enriched stages
export interface PipelineData {
	id: string;
	name: string;
	originId?: string;
	dateAdded: string;
	dateUpdated: string;
	stages: PipelineStageWithData[];
	totalOpportunities: number;
	totalValue: number;
	showInFunnel?: boolean;
	showInPieChart?: boolean;
	healthScore?: {
		score: number;
		breakdown: {
			distribution: number;
			velocity: number;
			conversion: number;
		};
	};
}

// FIXED: Quick stats response with meta property
export interface QuickPipelineStats {
	pipelines: Pipeline[]; // Basic pipeline info without opportunity data
	totalPipelines: number;
	lastUpdated: string;
	mode: "quick";
	meta: {
		mode: "quick";
		totalFetched: number;
		totalEstimated: number;
		complete: false; // Quick data is never complete
		lastUpdated: string;
		duration?: number;
	};
}

// Bulk fetch response (updated to use correct types)
export interface BulkFetchResponse {
	error: string;
	success: boolean;
	pipelines: PipelineData[];
	overallStats: {
		totalOpportunities: number;
		totalValue: number;
		totalPipelines: number;
		avgOpportunitiesPerPipeline: number;
	};
	meta: {
		mode: "complete";
		totalFetched: number;
		totalEstimated: number;
		pageCount: number;
		duration: number;
		complete: true; // Bulk data is always complete when successful
		lastUpdated: string;
		selectedPipelineId: string | null;
	};
}

// Bulk opportunities response from GHL service
export interface BulkOpportunityResponse {
	opportunities: Opportunity[];
	totalFetched: number;
	totalEstimated: number;
	pageCount: number;
	duration: number;
}

// Options for getAllOpportunities method
export interface GetAllOpportunitiesOptions {
	onProgress?: (fetched: number, estimated: number, pages: number) => void;
	onError?: (error: Error, currentPage: number) => void;
	maxRetries?: number;
	delayBetweenRequests?: number;
	filters?: Record<string, any>;
}

// Individual stage interface
export interface PipelineStage {
	id: string;
	name: string;
	originId?: string; // Optional as not all stages have this
	position: number;
	showInFunnel: boolean;
	showInPieChart: boolean;
}

// Individual pipeline interface
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

// Response interface for the API call
export interface PipelinesResponse {
	pipelines: Pipeline[];
	traceId: string;
}

// Utility type for stage selection/filtering
export interface StageOption {
	value: string; // stage id
	label: string; // stage name
	pipelineId: string;
	pipelineName: string;
	position: number;
}

// Utility type for pipeline selection
export interface PipelineOption {
	value: string; // pipeline id
	label: string; // pipeline name
	stageCount: number;
}

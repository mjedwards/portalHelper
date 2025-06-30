/* src/hooks/usePipelines.ts */
import { fetcher } from "@/utils/api/fetcher";
import useSWR from "swr";

interface Pipeline {
	id: string;
	name: string;
	stages: Array<{
		id: string;
		name: string;
		position: number;
	}>;
}

interface UsePipelinesOptions {
	autoRefresh?: boolean;
	refreshInterval?: number;
}

/**
 * Hook for fetching pipeline configurations
 * This is separate from pipeline stats for better separation of concerns
 */
export const usePipelines = (
	locationId: string,
	options: UsePipelinesOptions = {}
) => {
	const {
		autoRefresh = true,
		refreshInterval = 30 * 60 * 1000, // 30 minutes (pipelines change rarely)
	} = options;

	const { data, error, isValidating, mutate } = useSWR(
		locationId
			? `/api/ghl/opportunities/getPipelines?locationId=${locationId}`
			: null,
		fetcher,
		{
			refreshInterval: autoRefresh ? refreshInterval : 0,
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 10 * 60 * 1000, // 10 minutes
			errorRetryCount: 3,
			errorRetryInterval: 5000,
		}
	);

	return {
		pipelines: (data?.pipelines || []) as Pipeline[],
		error,
		isLoading: !data && !error,
		isValidating,
		refresh: mutate,
	};
};

/**
 * Hook for getting pipeline options for dropdowns
 */
export const usePipelineOptions = (locationId: string) => {
	const { pipelines, error, isLoading } = usePipelines(locationId);

	const pipelineOptions = pipelines.map((pipeline) => ({
		value: pipeline.id,
		label: pipeline.name,
		stageCount: pipeline.stages.length,
	}));

	const stageOptions = pipelines
		.flatMap((pipeline) =>
			pipeline.stages.map((stage) => ({
				value: stage.id,
				label: stage.name,
				pipelineId: pipeline.id,
				pipelineName: pipeline.name,
				position: stage.position,
			}))
		)
		.sort((a, b) => {
			if (a.pipelineName !== b.pipelineName) {
				return a.pipelineName.localeCompare(b.pipelineName);
			}
			return a.position - b.position;
		});

	return {
		pipelineOptions,
		stageOptions,
		error,
		isLoading,
	};
};

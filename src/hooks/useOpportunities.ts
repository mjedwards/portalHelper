import { fetcher } from "@/utils/api/fetcher";
import useSWR from "swr";

interface UseOpportunitiesOptions {
	locationId: string;
	pipelineId?: string;
	limit?: number;
	enabled?: boolean;
}

export const useOpportunities = ({
	locationId,
	pipelineId,
	limit = 100,
	enabled = true,
}: UseOpportunitiesOptions) => {
	const queryParams = new URLSearchParams({
		locationId,
		...(pipelineId && { pipelineId }),
		limit: limit.toString(),
	});

	const { data, error, isValidating, mutate } = useSWR(
		enabled && locationId ? `/api/ghl/opportunities?${queryParams}` : null,
		fetcher,
		{
			refreshInterval: 5 * 60 * 1000, // 5 minutes
			revalidateOnFocus: false,
			dedupingInterval: 60000,
		}
	);

	return {
		opportunities: data?.opportunities || [],
		meta: data?.meta,
		error,
		isLoading: !data && !error,
		isValidating,
		refresh: mutate,
	};
};

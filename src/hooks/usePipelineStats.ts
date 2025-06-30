/* eslint-disable @typescript-eslint/no-unused-vars */
/* src/hooks/usePipelineStats.ts */
import useSWR from "swr";
import { useState, useCallback, useRef, useEffect } from "react";
import { fetcher } from "@/utils/api/fetcher";
import { BulkFetchResponse, QuickPipelineStats } from "@/app/types/pipeline";
import { calculatePipelineStats } from "@/utils/calculations";

interface PipelineStatsOptions {
	locationId: string;
	selectedPipelineId?: string;
	autoRefresh?: boolean;
	refreshInterval?: number;
	testMode?: boolean;
}

interface BulkProgress {
	current: number;
	total: number;
	pageCount: number;
	percentage: number;
}

interface PipelineStatsMeta {
	estimatedTotal?: number;
	mode?: "quick" | "complete";
	totalFetched?: number;
	totalEstimated?: number;
	complete?: boolean;
	lastUpdated?: string;
	duration?: number;
}

interface UsePipelineStatsReturn {
	// Data - FIXED: Handle undefined properly
	data: QuickPipelineStats | BulkFetchResponse | null;
	quickData: QuickPipelineStats | null;
	bulkData: BulkFetchResponse | null;
	error: Error | null;

	// Loading states
	isLoading: boolean;
	isValidating: boolean;
	isBulkLoading: boolean;
	bulkProgress: BulkProgress;
	isComplete: boolean;

	// Meta information
	meta: PipelineStatsMeta | null;

	// Actions
	quickRefresh: () => Promise<QuickPipelineStats | undefined>;
	fullRefresh: () => Promise<void>;
	cancelBulkFetch: () => void;
	mutate: () => Promise<QuickPipelineStats | undefined>;
}

/**
 * Clean pipeline stats hook with separated concerns
 * Uses SWR for quick data and manual fetching for bulk operations
 */
export const usePipelineStats = ({
	locationId,
	selectedPipelineId,
	autoRefresh = true,
	refreshInterval = 5 * 60 * 1000, // 5 minutes
	testMode = false,
}: PipelineStatsOptions): UsePipelineStatsReturn => {
	// SWR for quick/cached pipeline stats
	const {
		data: swrData,
		error: swrError,
		isValidating,
		mutate,
	} = useSWR<QuickPipelineStats>(
		locationId && !testMode
			? `/api/ghl/opportunities/getPipelineStats?locationId=${locationId}`
			: null,
		fetcher,
		{
			refreshInterval: autoRefresh ? refreshInterval : 0,
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 60000, // 1 minute
			errorRetryCount: 3,
			errorRetryInterval: 5000,
		}
	);

	// FIXED: Convert undefined to null for consistency
	const quickData = swrData ?? null;

	// Bulk loading state
	const [isBulkLoading, setIsBulkLoading] = useState(false);
	const [bulkError, setBulkError] = useState<Error | null>(null);
	const [bulkProgress, setBulkProgress] = useState<BulkProgress>({
		current: 0,
		total: 0,
		pageCount: 0,
		percentage: 0,
	});
	const [bulkData, setBulkData] = useState<BulkFetchResponse | null>(null);

	const abortControllerRef = useRef<AbortController | null>(null);
	const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (isBulkLoading && !testMode) {
			// Simulate progress updates while loading
			const startTime = Date.now();
			let currentProgress = 0;

			progressIntervalRef.current = setInterval(() => {
				const elapsed = Date.now() - startTime;

				// Simulate realistic progress curve (fast start, then slower)
				if (elapsed < 2000) {
					// First 2 seconds: 0-30%
					currentProgress = Math.min(30, (elapsed / 2000) * 30);
				} else if (elapsed < 10000) {
					// Next 8 seconds: 30-70%
					currentProgress = 30 + Math.min(40, ((elapsed - 2000) / 8000) * 40);
				} else if (elapsed < 30000) {
					// Next 20 seconds: 70-90%
					currentProgress = 70 + Math.min(20, ((elapsed - 10000) / 20000) * 20);
				} else {
					// After 30 seconds: 90-95% (slow progress to indicate it's taking time)
					currentProgress = 90 + Math.min(5, ((elapsed - 30000) / 30000) * 5);
				}

				// Estimate page count and records based on progress
				const estimatedTotal = 3350; // Default estimate
				const estimatedCurrent = Math.floor(
					(currentProgress / 100) * estimatedTotal
				);
				const estimatedPages = Math.floor(estimatedCurrent / 100) + 1;

				setBulkProgress({
					current: estimatedCurrent,
					total: estimatedTotal,
					pageCount: estimatedPages,
					percentage: currentProgress,
				});
			}, 500); // Update every 500ms

			return () => {
				if (progressIntervalRef.current) {
					clearInterval(progressIntervalRef.current);
					progressIntervalRef.current = null;
				}
			};
		} else {
			// Clear interval when not loading
			if (progressIntervalRef.current) {
				clearInterval(progressIntervalRef.current);
				progressIntervalRef.current = null;
			}
		}
	}, [isBulkLoading, testMode]);

	// Quick refresh using SWR
	const quickRefresh = useCallback(async () => {
		console.log("🔄 Quick refresh triggered");
		return await mutate();
	}, [mutate]);

	// Complete data fetch using bulk endpoint
	const fetchCompleteData = useCallback(async (): Promise<void> => {
		if (!locationId) {
			console.warn("⚠️ No locationId provided for bulk fetch");
			return;
		}

		// Create abort controller for cancellation
		abortControllerRef.current = new AbortController();

		setIsBulkLoading(true);
		setBulkError(null);
		setBulkProgress({ current: 0, total: 0, pageCount: 0, percentage: 0 });

		try {
			console.log("🚀 Starting complete data fetch...");

			// Handle test mode
			// if (testMode) {
			// 	console.log("🧪 Using test mode - returning mock data");

			// 	// Simulate loading time with progress updates
			// 	for (let i = 0; i <= 100; i += 10) {
			// 		if (abortControllerRef.current?.signal.aborted) {
			// 			throw new Error("Operation cancelled");
			// 		}

			// 		setBulkProgress({
			// 			current: Math.floor((i / 100) * 25),
			// 			total: 25,
			// 			pageCount: Math.floor(i / 10) + 1,
			// 			percentage: i,
			// 		});

			// 		await new Promise((resolve) => setTimeout(resolve, 200));
			// 	}

			// 	// Create mock data using your calculation functions
			// 	const mockPipelines = [
			// 		{
			// 			id: "pipeline-1",
			// 			name: "Sales Pipeline",
			// 			stages: [
			// 				{ id: "stage-1", name: "Lead", position: 0 },
			// 				{ id: "stage-2", name: "Qualified", position: 1 },
			// 				{ id: "stage-3", name: "Proposal", position: 2 },
			// 				{ id: "stage-4", name: "Closed Won", position: 3 },
			// 			],
			// 		},
			// 	];

			// 	const mockOpportunities = [
			// 		{
			// 			id: "1",
			// 			name: "Opp 1",
			// 			pipelineId: "pipeline-1",
			// 			stageId: "stage-1",
			// 			monetaryValue: 5000,
			// 			status: "open",
			// 			dateAdded: "2024-01-01",
			// 		},
			// 		{
			// 			id: "2",
			// 			name: "Opp 2",
			// 			pipelineId: "pipeline-1",
			// 			stageId: "stage-1",
			// 			monetaryValue: 3000,
			// 			status: "open",
			// 			dateAdded: "2024-01-02",
			// 		},
			// 		{
			// 			id: "3",
			// 			name: "Opp 3",
			// 			pipelineId: "pipeline-1",
			// 			stageId: "stage-2",
			// 			monetaryValue: 7000,
			// 			status: "open",
			// 			dateAdded: "2024-01-03",
			// 		},
			// 	];

			// 	// Use your calculation function!
			// 	const calculatedStats = calculatePipelineStats(
			// 		mockPipelines,
			// 		mockOpportunities
			// 	);

			// 	const mockData: BulkFetchResponse = {
			// 		success: true,
			// 		pipelines: calculatedStats.pipelines.map((pipeline) => ({
			// 			...pipeline,
			// 			stages: pipeline.stages.map((stage) => ({
			// 				id: stage.stageId,
			// 				name: stage.stageName,
			// 				position: stage.position,
			// 				showInFunnel: true,
			// 				showInPieChart: true,
			// 				opportunities: stage.opportunities,
			// 				totalValue: stage.totalValue,
			// 				count: stage.opportunityCount,
			// 			})),
			// 		})),
			// 		overallStats: {
			// 			totalOpportunities: calculatedStats.totalOpportunities,
			// 			totalValue: calculatedStats.totalValue,
			// 			totalPipelines: calculatedStats.pipelines.length,
			// 			avgOpportunitiesPerPipeline: Math.round(
			// 				calculatedStats.totalOpportunities /
			// 					calculatedStats.pipelines.length
			// 			),
			// 		},
			// 		meta: {
			// 			mode: "complete",
			// 			totalFetched: calculatedStats.totalOpportunities,
			// 			totalEstimated: calculatedStats.totalOpportunities,
			// 			pageCount: 1,
			// 			duration: 2000,
			// 			complete: true,
			// 			lastUpdated: new Date().toISOString(),
			// 			selectedPipelineId: selectedPipelineId || null,
			// 		},
			// 	};

			// 	setBulkData(mockData);
			// 	return;
			// }

			const requestBody = {
				locationId,
				selectedPipelineId: selectedPipelineId || null,
			};

			const response = await fetch("/api/ghl/opportunities/bulk-fetch", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
				signal: abortControllerRef.current.signal,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			const data: BulkFetchResponse = await response.json();

			if (!data.success) {
				throw new Error(
					data.error || "Bulk fetch returned unsuccessful status"
				);
			}

			setBulkData(data);
			console.log("✅ Complete data fetch successful:", data.meta);

			// Update progress to 100% completion
			setBulkProgress({
				current: data.meta.totalFetched,
				total: data.meta.totalEstimated,
				pageCount: data.meta.pageCount,
				percentage: 100,
			});

			// Optionally refresh the quick data cache
			await mutate();
		} catch (error) {
			// Don't log abort errors as they're intentional
			if (error instanceof Error && error.name === "AbortError") {
				console.log("🛑 Bulk fetch cancelled by user");
				return;
			}

			console.error("❌ Complete data fetch failed:", error);
			setBulkError(error as Error);
		} finally {
			setIsBulkLoading(false);
			abortControllerRef.current = null;

			// Clear progress interval
			// if (progressIntervalRef.current) {
			// 	clearInterval(progressIntervalRef.current);
			// 	progressIntervalRef.current = null;
			// }
		}
	}, [locationId, selectedPipelineId, mutate]);

	// Cancel bulk operation
	const cancelBulkFetch = useCallback((): void => {
		console.log("🛑 Cancelling bulk fetch");

		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}

		setIsBulkLoading(false);
		setBulkProgress({ current: 0, total: 0, pageCount: 0, percentage: 0 });
		setBulkError(null);
	}, []);

	// Computed values
	const currentData = bulkData || quickData;
	const isComplete = bulkData?.meta?.complete || false;
	const isLoading = !quickData && !swrError && !bulkData && isValidating;
	const error = bulkError || swrError;

	// FIXED: Meta information with proper null handling
	const meta: PipelineStatsMeta | null = currentData?.meta
		? {
				mode: bulkData ? "complete" : "quick",
				totalFetched: currentData.meta.totalFetched || 0,
				totalEstimated: currentData.meta.totalEstimated || 0,
				complete: currentData.meta.complete,
				lastUpdated: currentData.meta.lastUpdated,
				duration: currentData.meta.duration,
		  }
		: null;

	console.log(bulkData);
	return {
		// Data
		data: currentData,
		quickData,
		bulkData,
		error,

		// Loading states
		isLoading,
		isValidating,
		isBulkLoading,
		bulkProgress,
		isComplete,

		// Meta information
		meta,

		// Actions
		quickRefresh,
		fullRefresh: fetchCompleteData,
		cancelBulkFetch,
		mutate,
	};
};

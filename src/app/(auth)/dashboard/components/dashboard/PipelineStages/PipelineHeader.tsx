/* src/app/(auth)/dashboard/components/dashboard/PipelineStages/PipelineHeader.tsx */
"use client";

import { useMemo } from "react";

interface DataFreshness {
	text: string;
	color: string;
}

interface MetaData {
	mode?: string;
	lastUpdated?: string;
	totalFetched?: number;
	estimatedTotal?: number;
	duration?: number;
}

interface PipelineHeaderProps {
	freshness: DataFreshness;
	meta?: MetaData;
	isComplete: boolean;
	isLoading: boolean;
	isValidating: boolean;
	isBulkLoading: boolean;
	onQuickRefresh: () => void;
	onFullRefresh: () => void;
	onCancelBulkFetch: () => void;
	title?: string;
}

/**
 * Enhanced header component for pipeline statistics with refresh controls and data freshness indicators
 */
export const PipelineHeader = ({
	freshness,
	meta,
	isComplete,
	isLoading,
	isValidating,
	isBulkLoading,
	onQuickRefresh,
	onFullRefresh,
	onCancelBulkFetch,
	title = "Pipeline Stages",
}: PipelineHeaderProps) => {
	// Calculate status indicators
	const statusInfo = useMemo(() => {
		if (isBulkLoading) {
			return {
				color: "bg-blue-500 animate-pulse",
				label: "Loading complete data...",
				description: "Fetching all pipeline data from GoHighLevel",
			};
		}

		if (isComplete) {
			return {
				color: "bg-green-500",
				label: "Complete data loaded",
				description: `Showing all ${
					meta?.totalFetched?.toLocaleString() || 0
				} opportunities`,
			};
		}

		return {
			color: "bg-yellow-500",
			label: "Preview data only",
			description: "Click 'Complete' for full dataset",
		};
	}, [isBulkLoading, isComplete, meta]);

	// Format duration for display
	const formatDuration = (duration: number) => {
		const seconds = Math.floor(duration / 1000);
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	};

	return (
		<div className='flex items-center justify-between mb-4'>
			{/* Left side - Title and status indicators */}
			<div className='flex items-center gap-3'>
				<h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
					{title}
				</h2>

				{/* Data freshness and completeness indicators */}
				{meta && (
					<div className='flex items-center gap-2'>
						{/* Completion status indicator */}
						<div
							className={`w-2 h-2 rounded-full transition-colors ${statusInfo.color}`}
							aria-label={statusInfo.label}
							title={statusInfo.description}
						/>

						{/* Freshness indicator */}
						<span
							className={`text-xs transition-colors ${freshness.color}`}
							title={`Data last updated: ${freshness.text}`}>
							{freshness.text}
							{meta.mode === "quick" && !isComplete && (
								<span className='ml-1 text-gray-400 dark:text-gray-500'>
									(preview)
								</span>
							)}
						</span>

						{/* Data count indicator for incomplete data */}
						{!isComplete && meta.totalFetched && meta.estimatedTotal && (
							<span className='text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full'>
								{meta.totalFetched.toLocaleString()} / ~
								{meta.estimatedTotal.toLocaleString()}
							</span>
						)}

						{/* Performance indicator */}
						{meta.duration && isComplete && (
							<span className='text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full'>
								{formatDuration(meta.duration)}
							</span>
						)}
					</div>
				)}
			</div>

			{/* Right side - Loading indicator and controls */}
			<div className='flex items-center gap-2'>
				{/* Loading spinner */}
				{(isLoading || (isValidating && !isBulkLoading)) && (
					<div
						className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'
						aria-label='Loading data'
						role='status'
					/>
				)}

				{/* Refresh control buttons */}
				<div
					className='flex gap-1'
					role='group'
					aria-label='Data refresh controls'>
					{/* Quick refresh button */}
					<button
						onClick={onQuickRefresh}
						disabled={isValidating || isBulkLoading}
						className={`
							px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
							focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
							${
								isValidating || isBulkLoading
									? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-500"
									: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-95"
							}
						`}
						title='Quick refresh using cached data'
						aria-label='Quick refresh'>
						{isValidating && !isBulkLoading ? (
							<div className='flex items-center gap-1'>
								<div className='w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin'></div>
								<span>Refreshing...</span>
							</div>
						) : (
							"Quick"
						)}
					</button>

					{/* Complete refresh button */}
					<button
						onClick={onFullRefresh}
						disabled={isValidating || isBulkLoading}
						className={`
							px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
							focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
							${
								isValidating || isBulkLoading
									? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-500"
									: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 active:scale-95"
							}
						`}
						title='Complete refresh - loads all data (may take a while)'
						aria-label='Complete refresh'>
						{isBulkLoading ? (
							<div className='flex items-center gap-1'>
								<div className='w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin'></div>
								<span>Loading...</span>
							</div>
						) : (
							"Complete"
						)}
					</button>

					{/* Cancel button - only shown during bulk loading */}
					{isBulkLoading && (
						<button
							onClick={onCancelBulkFetch}
							className='px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:scale-95'
							title='Cancel bulk data loading'
							aria-label='Cancel loading'>
							Cancel
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

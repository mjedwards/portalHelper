/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { formatCurrency } from "@/utils/calculations/pipelineCalculations";
import { PIPELINE_STAGE_COLORS } from "@/utils/constants/pipeline";

// Import the enhanced components
import { PipelineHeader } from "./PipelineHeader";
import { BulkLoadingProgress } from "./BulkLoadingProgress";
import { StageCard } from "./StageCard";
import { PipelineSelector } from "./PipelineSelector";

interface PipelineStageCardsProps {
	locationId: string;
	hasLocationError?: boolean;
}

// FIXED: Match the interface that StageCard expects
interface StageData {
	stageId: string;
	stageName: string;
	position: number;
	opportunityCount: number;
	totalValue: number;
	averageValue: number;
	opportunities?: Array<{
		id: string;
		name: string;
		monetaryValue: number;
		status: string;
		dateAdded: string;
	}>;
}

// FIXED: Match what PipelineSelector expects
interface PipelineData {
	id: string;
	name: string;
	totalOpportunities: number;
	totalValue: number;
	stages: StageData[];
}

export default function PipelineStageCards({
	locationId,
	hasLocationError = false,
}: PipelineStageCardsProps) {
	const [selectedPipeline, setSelectedPipeline] = useState<string>("");
	const [selectedStage, setSelectedStage] = useState<string>("");

	// Enhanced pipeline stats hook
	const {
		data: pipelineData,
		error,
		isLoading,
		isValidating,
		isBulkLoading,
		bulkProgress,
		isComplete,
		meta,
		quickRefresh,
		fullRefresh,
		cancelBulkFetch,
	} = usePipelineStats({
		locationId: locationId && !hasLocationError ? locationId : "",
		selectedPipelineId: selectedPipeline,
		autoRefresh: true,
		refreshInterval: 5 * 60 * 1000,
	});

	// FIXED: Transform the data properly based on the response type
	const transformPipelineData = (): PipelineData[] => {
		if (!pipelineData) return [];

		// Check if it's BulkFetchResponse (has 'success' property)
		if ("success" in pipelineData && pipelineData.pipelines) {
			// Transform BulkFetchResponse.pipelines to expected format
			return pipelineData.pipelines.map((pipeline) => ({
				id: pipeline.id,
				name: pipeline.name,
				totalOpportunities: pipeline.totalOpportunities,
				totalValue: pipeline.totalValue,
				stages: pipeline.stages.map((stage) => {
					const stageCount = stage.count ?? 0;
					const stageTotalValue = stage.totalValue ?? 0;

					return {
						stageId: stage.id,
						stageName: stage.name,
						position: stage.position,
						opportunityCount: stageCount,
						totalValue: stageTotalValue,
						averageValue: stageCount > 0 ? stageTotalValue / stageCount : 0,
						opportunities:
							stage.opportunities?.map((opp) => ({
								id: opp.id,
								name: opp.name,
								monetaryValue: opp.monetaryValue || 0,
								status: opp.status,
								dateAdded: opp.dateAdded || new Date().toISOString(),
							})) || [],
					};
				}),
			}));
		}

		// Check if it's QuickPipelineStats (has 'pipelines' array of basic Pipeline objects)
		if ("pipelines" in pipelineData && Array.isArray(pipelineData.pipelines)) {
			// Transform QuickPipelineStats.pipelines to expected format (no opportunity data)
			return pipelineData.pipelines.map((pipeline) => ({
				id: pipeline.id,
				name: pipeline.name,
				totalOpportunities: 0, // Quick data doesn't have opportunity counts
				totalValue: 0, // Quick data doesn't have values
				stages: pipeline.stages.map((stage) => ({
					stageId: stage.id,
					stageName: stage.name,
					position: stage.position,
					opportunityCount: 0, // No opportunity data in quick response
					totalValue: 0,
					averageValue: 0,
					opportunities: [],
				})),
			}));
		}

		return [];
	};

	// Extract pipeline stats with proper transformation
	const pipelineStats: PipelineData[] = transformPipelineData();
	const currentSelectedPipeline =
		selectedPipeline || pipelineStats[0]?.id || "";
	const selectedPipelineData = pipelineStats.find(
		(p) => p.id === currentSelectedPipeline
	);

	// Utility functions
	const getStageColor = (position: number): string => {
		return PIPELINE_STAGE_COLORS[position % PIPELINE_STAGE_COLORS.length];
	};

	const getDataFreshnessInfo = () => {
		if (!meta?.lastUpdated) return { text: "Unknown", color: "text-gray-500" };

		const diff = Date.now() - new Date(meta.lastUpdated).getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(minutes / 60);

		if (minutes < 5)
			return { text: "Just now", color: "text-green-600 dark:text-green-400" };
		if (minutes < 60)
			return {
				text: `${minutes}m ago`,
				color: "text-green-600 dark:text-green-400",
			};
		if (hours < 2)
			return {
				text: `${hours}h ago`,
				color: "text-yellow-600 dark:text-yellow-400",
			};
		return { text: `${hours}h ago`, color: "text-red-600 dark:text-red-400" };
	};

	const freshness = getDataFreshnessInfo();

	// Handle stage selection
	const handleStageClick = (stageId: string) => {
		setSelectedStage(selectedStage === stageId ? "" : stageId);
	};

	// Handle pipeline change and reset stage selection
	const handlePipelineChange = (pipelineId: string) => {
		setSelectedPipeline(pipelineId);
		setSelectedStage(""); // Reset stage selection when pipeline changes
	};

	// Error state
	if (hasLocationError) {
		return <LocationErrorState />;
	}

	// DEBUG: Log the data for troubleshooting
	console.log("🔍 PipelineStageCards Debug:", {
		pipelineData,
		transformedPipelineStats: pipelineStats,
		selectedPipelineData,
		meta,
		isComplete,
		isBulkLoading,
	});

	// FIXED: Transform meta to match PipelineHeader expectations and provide defaults
	const transformedMeta = meta
		? {
				mode: meta.mode,
				lastUpdated: meta.lastUpdated,
				totalFetched: meta.totalFetched || 0,
				estimatedTotal: meta.estimatedTotal || 0,
				duration: meta.duration || 0,
		  }
		: undefined;

	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden'>
			{/* Header Section */}
			<div className='p-6 border-b border-gray-100 dark:border-gray-700'>
				<PipelineHeader
					freshness={freshness}
					meta={transformedMeta}
					isComplete={isComplete}
					isLoading={isLoading}
					isValidating={isValidating}
					isBulkLoading={isBulkLoading}
					onQuickRefresh={quickRefresh}
					onFullRefresh={fullRefresh}
					onCancelBulkFetch={cancelBulkFetch}
				/>

				{/* Bulk Loading Progress */}
				{isBulkLoading && (
					<BulkLoadingProgress
						progress={bulkProgress}
						onCancel={cancelBulkFetch}
					/>
				)}

				{/* FIXED: Data Completeness Warning with proper null checks */}
				{!isComplete &&
					meta &&
					(meta.totalFetched || 0) < (meta.estimatedTotal || 0) &&
					!isBulkLoading && (
						<DataCompletenessWarning
							totalFetched={meta.totalFetched || 0}
							estimatedTotal={meta.estimatedTotal || 0}
							onLoadComplete={fullRefresh}
						/>
					)}

				{/* ADDED: Data Status Indicator */}
				{pipelineStats.length > 0 && (
					<div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-blue-700 dark:text-blue-300'>
								Data Status: {isComplete ? "Complete Dataset" : "Preview Mode"}
							</span>
							<span className='text-blue-600 dark:text-blue-400'>
								{pipelineStats.length} pipeline
								{pipelineStats.length !== 1 ? "s" : ""} loaded
							</span>
						</div>
					</div>
				)}
			</div>

			{/* Content Section */}
			<div className='p-6'>
				{error ? (
					<ErrorState error={error} onRetry={quickRefresh} />
				) : pipelineStats.length > 0 ? (
					<>
						{/* Enhanced Pipeline Selector */}
						{pipelineStats.length > 1 && (
							<PipelineSelector
								pipelines={pipelineStats}
								selectedPipeline={currentSelectedPipeline}
								onPipelineChange={handlePipelineChange}
								isLoading={isValidating}
								showDetails={true}
							/>
						)}

						{/* Single Pipeline Summary (when only one pipeline) */}
						{pipelineStats.length === 1 && selectedPipelineData && (
							<SinglePipelineSummary pipeline={selectedPipelineData} />
						)}

						{/* Stages List */}
						{selectedPipelineData && (
							<>
								<div className='mb-4 flex items-center justify-between'>
									<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
										Pipeline Stages
									</h3>
									<div className='flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
										<span>{selectedPipelineData.stages.length} stages</span>
										<span className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded'>
											{selectedPipelineData.totalOpportunities} total
											opportunities
										</span>
									</div>
								</div>

								<div className='space-y-3 max-h-96 overflow-y-auto'>
									{selectedPipelineData.stages
										?.sort((a, b) => a.position - b.position)
										.map((stage) => (
											<StageCard
												key={stage.stageId}
												stage={stage}
												totalOpportunities={
													selectedPipelineData.totalOpportunities
												}
												getStageColor={getStageColor}
												onClick={() => handleStageClick(stage.stageId)}
												isSelected={selectedStage === stage.stageId}
											/>
										))}
								</div>

								{/* Stage Details (if one is selected) */}
								{selectedStage && (
									<SelectedStageDetails
										stage={selectedPipelineData.stages.find(
											(s) => s.stageId === selectedStage
										)}
										getStageColor={getStageColor}
									/>
								)}
							</>
						)}
					</>
				) : isLoading ? (
					<LoadingSkeleton />
				) : (
					<EmptyState />
				)}

				{/* Footer Actions */}
				<FooterActions />
			</div>
		</div>
	);
}

// Helper components remain the same...
const LocationErrorState = () => (
	<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden'>
		<div className='p-6 border-b border-gray-100 dark:border-gray-700'>
			<h2 className='text-xl font-semibold dark:text-white'>Pipeline Stages</h2>
		</div>
		<div className='p-6'>
			<div className='text-center py-12'>
				<svg
					className='w-16 h-16 mx-auto text-red-400 dark:text-red-600 mb-4'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
					/>
				</svg>
				<h3 className='text-lg font-medium text-red-600 dark:text-red-400 mb-2'>
					Unable to load pipeline data
				</h3>
				<p className='text-gray-500 dark:text-gray-400'>
					Please select a location first to view pipeline information
				</p>
			</div>
		</div>
	</div>
);

const DataCompletenessWarning = ({
	totalFetched,
	estimatedTotal,
	onLoadComplete,
}: {
	totalFetched: number;
	estimatedTotal: number;
	onLoadComplete: () => void;
}) => (
	<div className='mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
		<div className='flex items-start gap-3'>
			<svg
				className='w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0'
				fill='none'
				stroke='currentColor'
				viewBox='0 0 24 24'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={2}
					d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
				/>
			</svg>
			<div>
				<p className='text-sm text-yellow-800 dark:text-yellow-200'>
					<span className='font-medium'>Partial data loaded:</span> Showing{" "}
					{totalFetched.toLocaleString()} of ~{estimatedTotal.toLocaleString()}{" "}
					opportunities.
				</p>
				<button
					onClick={onLoadComplete}
					className='mt-2 text-sm font-medium text-yellow-700 dark:text-yellow-300 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 rounded'>
					Load complete dataset →
				</button>
			</div>
		</div>
	</div>
);

// Rest of the helper components remain exactly the same...
const ErrorState = ({
	error,
	onRetry,
}: {
	error: any;
	onRetry: () => void;
}) => (
	<div className='text-center py-12'>
		<svg
			className='w-16 h-16 mx-auto text-red-400 dark:text-red-600 mb-4'
			fill='none'
			stroke='currentColor'
			viewBox='0 0 24 24'>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
			/>
		</svg>
		<h3 className='text-lg font-medium text-red-600 dark:text-red-400 mb-2'>
			{error.message || "Failed to load pipeline data"}
		</h3>
		<p className='text-gray-500 dark:text-gray-400 mb-4'>
			There was an error loading the pipeline information
		</p>
		<button
			onClick={onRetry}
			className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'>
			Try again
		</button>
	</div>
);

const SinglePipelineSummary = ({ pipeline }: { pipeline: PipelineData }) => (
	<div className='mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
		<div className='flex items-center justify-between'>
			<div>
				<h3 className='text-xl font-bold text-blue-900 dark:text-blue-100'>
					{pipeline.name}
				</h3>
				<p className='text-blue-700 dark:text-blue-300 mt-1'>
					Primary pipeline for this location
				</p>
			</div>
			<div className='text-right'>
				<div className='text-3xl font-bold text-blue-900 dark:text-blue-100'>
					{pipeline.totalOpportunities.toLocaleString()}
				</div>
				<div className='text-sm text-blue-600 dark:text-blue-400'>
					opportunities
				</div>
				<div className='text-xl font-bold text-green-600 dark:text-green-400 mt-2'>
					{formatCurrency(pipeline.totalValue)}
				</div>
			</div>
		</div>
	</div>
);

const SelectedStageDetails = ({
	stage,
	getStageColor,
}: {
	stage?: StageData;
	getStageColor: (position: number) => string;
}) => {
	if (!stage) return null;

	return (
		<div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
			<div className='flex items-center gap-3 mb-4'>
				<div
					className={`w-8 h-8 rounded-full ${getStageColor(
						stage.position
					)} flex items-center justify-center shadow-sm`}>
					<span className='text-white text-sm font-bold'>
						{stage.position + 1}
					</span>
				</div>
				<div>
					<h4 className='font-semibold text-blue-900 dark:text-blue-100 text-lg'>
						{stage.stageName}
					</h4>
					<p className='text-blue-700 dark:text-blue-300 text-sm'>
						Stage {stage.position + 1} Details
					</p>
				</div>
			</div>

			<div className='grid grid-cols-2 gap-6'>
				<div className='space-y-3'>
					<div>
						<span className='text-blue-700 dark:text-blue-300 text-sm font-medium block'>
							Opportunities
						</span>
						<span className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
							{stage.opportunityCount.toLocaleString()}
						</span>
					</div>
					<div>
						<span className='text-blue-700 dark:text-blue-300 text-sm font-medium block'>
							Stage Position
						</span>
						<span className='text-lg font-semibold text-blue-900 dark:text-blue-100'>
							{stage.position + 1}
						</span>
					</div>
				</div>

				<div className='space-y-3'>
					<div>
						<span className='text-blue-700 dark:text-blue-300 text-sm font-medium block'>
							Total Value
						</span>
						<span className='text-2xl font-bold text-green-600 dark:text-green-400'>
							{formatCurrency(stage.totalValue)}
						</span>
					</div>
					<div>
						<span className='text-blue-700 dark:text-blue-300 text-sm font-medium block'>
							Average Value
						</span>
						<span className='text-lg font-semibold text-green-600 dark:text-green-400'>
							{formatCurrency(stage.averageValue)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

const LoadingSkeleton = () => (
	<div className='space-y-6'>
		<div className='animate-pulse'>
			<div className='h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6'></div>
		</div>

		{[1, 2, 3, 4].map((i) => (
			<div key={i} className='animate-pulse'>
				<div className='flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg'>
					<div className='w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full' />
					<div className='flex-1'>
						<div className='h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2' />
						<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4' />
					</div>
					<div className='text-right'>
						<div className='h-6 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1' />
						<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-20' />
					</div>
				</div>
			</div>
		))}
	</div>
);

const EmptyState = () => (
	<div className='text-center py-16'>
		<svg
			className='w-20 h-20 mx-auto text-gray-400 dark:text-gray-600 mb-6'
			fill='none'
			stroke='currentColor'
			viewBox='0 0 24 24'>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={1.5}
				d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4'
			/>
		</svg>
		<h3 className='text-xl font-medium text-gray-900 dark:text-white mb-3'>
			No pipeline data available
		</h3>
		<p className='text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto'>
			It looks like there are no pipelines configured for this location. Check
			your location selection or contact your administrator.
		</p>
		<div className='flex items-center justify-center gap-4'>
			<button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'>
				Refresh Data
			</button>
			<button className='px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'>
				Change Location
			</button>
		</div>
	</div>
);

const FooterActions = () => (
	<div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-700'>
		<div className='flex items-center justify-between'>
			<Link
				href='/opportunities'
				className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'>
				<svg
					className='w-4 h-4 mr-2'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4'
					/>
				</svg>
				Manage Opportunities
			</Link>

			<div className='flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400'>
				<span>Need help?</span>
				<Link
					href='/help/pipelines'
					className='text-blue-600 dark:text-blue-400 hover:underline'>
					Pipeline Guide
				</Link>
			</div>
		</div>
	</div>
);

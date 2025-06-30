/* src/app/dashboard/components/PipelineSelector.tsx */
"use client";

import { formatCurrency } from "@/utils/calculations/pipelineCalculations";

interface PipelineData {
	id: string;
	name: string;
	totalOpportunities: number;
	totalValue: number;
	stages?: Array<{
		stageId: string;
		stageName: string;
		opportunityCount: number;
	}>;
}

interface PipelineSelectorProps {
	pipelines: PipelineData[];
	selectedPipeline: string;
	onPipelineChange: (pipelineId: string) => void;
	isLoading?: boolean;
	disabled?: boolean;
	showDetails?: boolean;
}

/**
 * Pipeline selector dropdown with enhanced display of pipeline statistics
 */
export const PipelineSelector = ({
	pipelines,
	selectedPipeline,
	onPipelineChange,
	isLoading = false,
	disabled = false,
	showDetails = true,
}: PipelineSelectorProps) => {
	const selectedPipelineData = pipelines.find((p) => p.id === selectedPipeline);

	// Format pipeline option text
	const formatPipelineOption = (pipeline: PipelineData) => {
		const opportunityText =
			pipeline.totalOpportunities === 1
				? "1 opportunity"
				: `${pipeline.totalOpportunities.toLocaleString()} opportunities`;

		const valueText =
			pipeline.totalValue > 0
				? ` • ${formatCurrency(pipeline.totalValue)}`
				: "";

		return `${pipeline.name} (${opportunityText}${valueText})`;
	};

	return (
		<div className='mb-6'>
			{/* Selector Label */}
			<div className='flex items-center justify-between mb-2'>
				<label
					htmlFor='pipeline-select'
					className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
					Select Pipeline
				</label>
				{pipelines.length > 0 && (
					<span className='text-xs text-gray-500 dark:text-gray-400'>
						{pipelines.length}{" "}
						{pipelines.length === 1 ? "pipeline" : "pipelines"} available
					</span>
				)}
			</div>

			{/* Main Selector */}
			<div className='relative'>
				<select
					id='pipeline-select'
					value={selectedPipeline}
					onChange={(e) => onPipelineChange(e.target.value)}
					disabled={disabled || isLoading || pipelines.length === 0}
					className={`
						w-full p-3 pr-10 text-sm border rounded-lg transition-colors appearance-none cursor-pointer
						${
							disabled || isLoading
								? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50"
								: "bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
						}
						border-gray-300 dark:border-gray-600 
						text-gray-900 dark:text-white 
						focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
						focus:outline-none
					`}
					aria-label='Select a pipeline to view its stages'>
					{pipelines.length === 0 ? (
						<option value=''>No pipelines available</option>
					) : (
						pipelines.map((pipeline) => (
							<option
								key={pipeline.id}
								value={pipeline.id}
								title={`${pipeline.name} - ${
									pipeline.totalOpportunities
								} opportunities worth ${formatCurrency(pipeline.totalValue)}`}>
								{formatPipelineOption(pipeline)}
							</option>
						))
					)}
				</select>

				{/* Loading spinner overlay */}
				{isLoading && (
					<div className='absolute right-8 top-1/2 transform -translate-y-1/2'>
						<div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
					</div>
				)}

				{/* Custom dropdown arrow */}
				<div className='absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
					<svg
						className={`w-4 h-4 transition-colors ${
							disabled || isLoading
								? "text-gray-400"
								: "text-gray-600 dark:text-gray-400"
						}`}
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						aria-hidden='true'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M19 9l-7 7-7-7'
						/>
					</svg>
				</div>
			</div>

			{/* Quick Stats (when not showing details) */}
			{!showDetails && selectedPipelineData && (
				<div className='mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
					<span>
						{selectedPipelineData.totalOpportunities.toLocaleString()}{" "}
						opportunities
					</span>
					<span className='font-medium text-green-600 dark:text-green-400'>
						{formatCurrency(selectedPipelineData.totalValue)}
					</span>
				</div>
			)}

			{/* Empty State */}
			{pipelines.length === 0 && !isLoading && (
				<div className='mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
					<div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
						<svg
							className='w-5 h-5'
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
						<span className='text-sm'>
							No pipelines found for this location
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

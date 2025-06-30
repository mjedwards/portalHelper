/* src/app/dashboard/components/StageCard.tsx */
"use client";

import { formatCurrency } from "@/utils/calculations/pipelineCalculations";

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

interface StageCardProps {
	stage: StageData;
	totalOpportunities: number;
	getStageColor: (position: number) => string;
	onClick?: () => void;
	isSelected?: boolean;
}

/**
 * Individual pipeline stage card showing statistics and progress
 */
export const StageCard = ({
	stage,
	totalOpportunities,
	getStageColor,
	onClick,
	isSelected = false,
}: StageCardProps) => {
	// FIXED: Calculate progress percentage with proper null/zero handling
	const progressPercentage =
		totalOpportunities > 0 && stage.opportunityCount > 0
			? Math.min(
					100,
					Math.max(0, (stage.opportunityCount / totalOpportunities) * 100)
			  )
			: 0;

	// Get color classes for the stage
	const stageColorClass = getStageColor(stage.position);

	// Determine if stage has meaningful data
	const hasData = stage.opportunityCount > 0;
	const hasValue = stage.totalValue > 0;

	// FIXED: Calculate conversion rate with proper null handling
	const conversionRate =
		totalOpportunities > 0 && stage.opportunityCount > 0
			? Math.round((stage.opportunityCount / totalOpportunities) * 100)
			: 0;

	return (
		<div
			className={`
				relative border rounded-lg p-4 transition-all duration-200 cursor-pointer
				${
					isSelected
						? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
						: "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
				}
				${onClick ? "hover:shadow-sm active:scale-[0.995]" : ""}
			`}
			onClick={onClick}
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={
				onClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onClick();
							}
					  }
					: undefined
			}
			aria-label={onClick ? `View details for ${stage.stageName}` : undefined}>
			{/* Stage header */}
			<div className='flex items-center justify-between mb-3'>
				<div className='flex items-center gap-3 min-w-0 flex-1'>
					{/* Stage position indicator */}
					<div
						className={`
							w-8 h-8 rounded-full ${stageColorClass} 
							flex items-center justify-center flex-shrink-0
							shadow-sm ring-2 ring-white dark:ring-gray-800
						`}
						aria-label={`Stage ${stage.position + 1}`}
						title={`Pipeline stage ${stage.position + 1}`}>
						<span className='text-white text-sm font-bold'>
							{stage.position + 1}
						</span>
					</div>

					{/* Stage details */}
					<div className='min-w-0 flex-1'>
						<h3 className='font-semibold text-gray-900 dark:text-white text-base truncate'>
							{stage.stageName}
						</h3>
						<div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1'>
							<span className='flex items-center gap-1'>
								<span className='w-2 h-2 rounded-full bg-current opacity-60'></span>
								{stage.opportunityCount} opportunities
							</span>
							{hasValue && (
								<span className='text-green-600 dark:text-green-400 font-medium'>
									Avg: {formatCurrency(stage.averageValue)}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Stage statistics */}
				<div className='text-right flex-shrink-0 ml-4'>
					<div className='font-bold text-gray-900 dark:text-white text-lg'>
						{formatCurrency(stage.totalValue)}
					</div>
					<div className='text-sm text-gray-500 dark:text-gray-400'>
						{stage.opportunityCount} leads
					</div>
					{conversionRate > 0 && (
						<div className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
							{conversionRate}% of pipeline
						</div>
					)}
				</div>
			</div>

			{/* Progress bar - FIXED: Only show if there are opportunities */}
			{totalOpportunities > 0 && stage.opportunityCount > 0 && (
				<div className='mb-2'>
					<div className='flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1'>
						<span>Pipeline distribution</span>
						<span>{progressPercentage.toFixed(1)}%</span>
					</div>
					<div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden'>
						<div
							className={`h-2 rounded-full transition-all duration-500 ease-out ${stageColorClass}`}
							style={{ width: `${progressPercentage}%` }}
							role='progressbar'
							aria-valuenow={progressPercentage}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`${progressPercentage.toFixed(
								1
							)}% of total opportunities in this stage`}
						/>
					</div>
				</div>
			)}

			{/* Empty state indicator */}
			{!hasData && (
				<div className='text-center py-2 text-gray-400 dark:text-gray-500 text-sm italic'>
					No opportunities in this stage
				</div>
			)}

			{/* Performance indicators */}
			{hasData && (
				<div className='flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700'>
					<div className='flex items-center gap-3'>
						{/* Value indicator */}
						<div
							className={`
							flex items-center gap-1
							${hasValue ? "text-green-600 dark:text-green-400" : "text-gray-400"}
						`}>
							<span className='w-1.5 h-1.5 rounded-full bg-current'></span>
							<span>{hasValue ? "Valued" : "No value"}</span>
						</div>

						{/* Activity indicator */}
						<div className='flex items-center gap-1 text-blue-600 dark:text-blue-400'>
							<span className='w-1.5 h-1.5 rounded-full bg-current'></span>
							<span>Active</span>
						</div>
					</div>

					{/* Action hint */}
					{onClick && (
						<span className='text-gray-400 dark:text-gray-500 italic'>
							Click for details →
						</span>
					)}
				</div>
			)}

			{/* Selection indicator */}
			{isSelected && (
				<div className='absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white dark:ring-gray-800'></div>
			)}
		</div>
	);
};

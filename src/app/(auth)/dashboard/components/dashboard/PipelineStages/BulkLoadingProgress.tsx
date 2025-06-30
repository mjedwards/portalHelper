/* src/app/dashboard/components/BulkLoadingProgress.tsx */
"use client";

interface BulkProgress {
	current: number;
	total: number;
	percentage: number;
	pageCount: number;
}

interface BulkLoadingProgressProps {
	progress: BulkProgress;
	onCancel: () => void;
}

/**
 * Progress indicator component for bulk data loading operations
 * Shows current progress, estimated time remaining, and allows cancellation
 */
export const BulkLoadingProgress = ({
	progress,
	onCancel,
}: BulkLoadingProgressProps) => {
	// Ensure percentage is always within valid bounds (0-100)
	const safePercentage = Math.min(100, Math.max(0, progress.percentage || 0));

	// Calculate estimated pages remaining
	const pagesRemaining =
		progress.total > 0 && progress.current < progress.total
			? Math.max(0, Math.ceil((progress.total - progress.current) / 100))
			: 0;

	// Determine progress bar color based on completion
	const getProgressColor = () => {
		if (safePercentage >= 90) return "bg-green-600 dark:bg-green-400";
		if (safePercentage >= 70) return "bg-blue-600 dark:bg-blue-400";
		if (safePercentage >= 40) return "bg-yellow-600 dark:bg-yellow-400";
		return "bg-blue-600 dark:bg-blue-400";
	};

	return (
		<div className='mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
			{/* Header with status and controls */}
			<div className='flex items-center justify-between mb-3'>
				<div className='flex items-center gap-2'>
					{/* Pulsing indicator */}
					<div
						className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'
						aria-hidden='true'
					/>
					<span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
						Loading complete data...
					</span>
				</div>

				<div className='flex items-center gap-3'>
					{/* Progress statistics */}
					<div className='text-right'>
						<div className='text-xs text-blue-700 dark:text-blue-300 font-medium'>
							{progress.current.toLocaleString()} /{" "}
							{progress.total.toLocaleString()}
						</div>
						<div className='text-xs text-blue-600 dark:text-blue-400'>
							{safePercentage}% complete
						</div>
					</div>

					{/* Cancel button */}
					<button
						onClick={onCancel}
						className='text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 underline hover:no-underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1'
						aria-label='Cancel bulk data loading'>
						Cancel
					</button>
				</div>
			</div>

			{/* Progress bar */}
			<div className='mb-2'>
				<div
					className='w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5 overflow-hidden'
					role='progressbar'
					aria-valuenow={safePercentage}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label={`Loading progress: ${safePercentage}% complete`}>
					<div
						className={`h-2.5 rounded-full transition-all duration-300 ease-out ${getProgressColor()}`}
						style={{
							width: `${safePercentage}%`,
							minWidth: safePercentage > 0 ? "4px" : "0px", // Ensure some visual feedback even at 1%
						}}
					/>
				</div>
			</div>

			{/* Progress details */}
			<div className='flex justify-between items-center text-xs text-blue-600 dark:text-blue-400'>
				<div className='flex items-center gap-4'>
					<span>Page {progress.pageCount.toLocaleString()}</span>
					{pagesRemaining > 0 && (
						<span>~{pagesRemaining.toLocaleString()} pages remaining</span>
					)}
				</div>

				{/* Performance info */}
				<div className='text-blue-500 dark:text-blue-400'>
					{progress.current > 0 && progress.pageCount > 0 && (
						<span>
							~{Math.round(progress.current / progress.pageCount)} records/page
						</span>
					)}
				</div>
			</div>

			{/* Additional info for long operations */}
			{safePercentage > 0 && safePercentage < 10 && (
				<div className='mt-2 text-xs text-blue-600 dark:text-blue-400 italic'>
					This may take a few minutes for large datasets...
				</div>
			)}
		</div>
	);
};

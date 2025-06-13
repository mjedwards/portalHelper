"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GhlClientService } from "@/utils/api/ghl.client.service";
import { PipelineStatistics } from "../types/pipeline-stats";

interface PipelineStageCardsProps {
	locationId: string;
	hasLocationError?: boolean;
}

export default function PipelineStageCards({
	locationId,
	hasLocationError = false,
}: PipelineStageCardsProps) {
	const [pipelineStats, setPipelineStats] = useState<PipelineStatistics[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedPipeline, setSelectedPipeline] = useState<string>("");

	useEffect(() => {
		if (locationId && !hasLocationError) {
			fetchPipelineStats();
		}
	}, [locationId, hasLocationError]);

	const fetchPipelineStats = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await GhlClientService.getPipelineStatistics(locationId);
			setPipelineStats(response.pipelines);

			// Select first pipeline by default
			if (response.pipelines.length > 0 && !selectedPipeline) {
				setSelectedPipeline(response.pipelines[0].id);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to fetch pipeline statistics"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const selectedPipelineData = pipelineStats.find(
		(p) => p.id === selectedPipeline
	);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
		}).format(value);
	};

	const getStageColor = (position: number) => {
		const colors = [
			"bg-blue-500",
			"bg-green-500",
			"bg-yellow-500",
			"bg-orange-500",
			"bg-red-500",
			"bg-purple-500",
			"bg-pink-500",
			"bg-indigo-500",
			"bg-teal-500",
			"bg-cyan-500",
		];
		return colors[position % colors.length];
	};

	// Error state
	if (hasLocationError) {
		return (
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700'>
				<h2 className='text-xl font-semibold dark:text-white mb-4'>
					Pipeline Stages
				</h2>
				<div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
					<div className='text-center py-4'>
						<svg
							className='w-8 h-8 mx-auto text-red-400 dark:text-red-600 mb-2'
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
						<p className='text-red-600 dark:text-red-400 text-sm font-medium'>
							Unable to load pipeline data
						</p>
						<p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
							Please select a location first
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700'>
			{/* Header */}
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl font-semibold dark:text-white'>
					Pipeline Stages
				</h2>
				{isLoading && (
					<div className='h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
				)}
			</div>

			<div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
				{error ? (
					<div className='text-center py-4'>
						<svg
							className='w-8 h-8 mx-auto text-red-400 dark:text-red-600 mb-2'
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
						<p className='text-red-600 dark:text-red-400 text-sm font-medium'>
							{error}
						</p>
						<button
							onClick={fetchPipelineStats}
							className='mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm'>
							Try again
						</button>
					</div>
				) : pipelineStats.length > 0 ? (
					<>
						{/* Pipeline Selector */}
						{pipelineStats.length > 1 && (
							<div className='mb-4'>
								<select
									value={selectedPipeline}
									onChange={(e) => setSelectedPipeline(e.target.value)}
									className='w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'>
									{pipelineStats.map((pipeline) => (
										<option key={pipeline.id} value={pipeline.id}>
											{pipeline.name} ({pipeline.totalOpportunities}{" "}
											opportunities)
										</option>
									))}
								</select>
							</div>
						)}

						{/* Pipeline Summary */}
						{selectedPipelineData && (
							<div className='mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
								<div className='flex items-center justify-between text-sm'>
									<div>
										<span className='font-medium text-gray-900 dark:text-white'>
											{selectedPipelineData.name}
										</span>
									</div>
									<div className='text-right'>
										<div className='font-medium text-gray-900 dark:text-white'>
											{selectedPipelineData.totalOpportunities} opportunities
										</div>
										<div className='text-green-600 dark:text-green-400 font-medium'>
											{formatCurrency(selectedPipelineData.totalValue)}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Stages List */}
						<div className='space-y-3 max-h-80 overflow-y-auto'>
							{selectedPipelineData?.stages
								.sort((a, b) => a.position - b.position)
								.map((stage) => (
									<div
										key={stage.stageId}
										className='border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center space-x-3'>
												{/* Stage Position Indicator */}
												<div
													className={`w-6 h-6 rounded-full ${getStageColor(
														stage.position
													)} flex items-center justify-center`}>
													<span className='text-white text-xs font-bold'>
														{stage.position + 1}
													</span>
												</div>

												<div>
													<h3 className='font-medium text-gray-900 dark:text-white text-sm'>
														{stage.stageName}
													</h3>
													<div className='flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1'>
														<span>{stage.opportunityCount} opportunities</span>
														{stage.averageValue > 0 && (
															<span>
																Avg: {formatCurrency(stage.averageValue)}
															</span>
														)}
													</div>
												</div>
											</div>

											{/* Stage Stats */}
											<div className='text-right'>
												<div className='font-medium text-gray-900 dark:text-white text-sm'>
													{formatCurrency(stage.totalValue)}
												</div>
												<div className='text-xs text-gray-500 dark:text-gray-400'>
													{stage.opportunityCount} leads
												</div>
											</div>
										</div>

										{/* Progress Bar */}
										{selectedPipelineData.totalOpportunities > 0 && (
											<div className='mt-2'>
												<div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5'>
													<div
														className={`h-1.5 rounded-full ${getStageColor(
															stage.position
														)}`}
														style={{
															width: `${
																(stage.opportunityCount /
																	selectedPipelineData.totalOpportunities) *
																100
															}%`,
														}}
													/>
												</div>
											</div>
										)}
									</div>
								))}
						</div>
					</>
				) : (
					<div className='text-center py-4'>
						<svg
							className='w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-2'
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
						<p className='text-gray-500 dark:text-gray-400 text-sm'>
							No pipeline data available
						</p>
					</div>
				)}

				{/* Footer Actions */}
				<div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
					<Link
						href='/opportunities'
						className='inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline'>
						<svg
							className='w-4 h-4 mr-1'
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
				</div>
			</div>
		</div>
	);
}

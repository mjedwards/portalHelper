/* src/utils/calculations/pipelineCalculations.ts */

// Type definitions for better type safety
export interface OpportunityData {
	id: string;
	name: string;
	pipelineId: string;
	pipelineStageId: string;
	stageId?: string;
	monetaryValue?: number;
	status: string;
	dateAdded: string;
	createdAt?: string;
}

export interface PipelineStage {
	id: string;
	name: string;
	position: number;
}

export interface Pipeline {
	id: string;
	name: string;
	stages: PipelineStage[];
}

export interface CalculatedStage {
	stageId: string;
	stageName: string;
	position: number;
	opportunityCount: number;
	totalValue: number;
	averageValue: number;
	opportunities: Array<{
		id: string;
		name: string;
		monetaryValue: number;
		status: string;
		dateAdded: string;
	}>;
}

export interface CalculatedPipeline {
	id: string;
	name: string;
	totalOpportunities: number;
	totalValue: number;
	stages: CalculatedStage[];
}

export interface PipelineStatsResult {
	pipelines: CalculatedPipeline[];
	totalOpportunities: number;
	totalValue: number;
}

/**
 * Calculate comprehensive pipeline statistics from raw pipeline and opportunity data
 * @param pipelines - Array of pipeline configurations
 * @param opportunities - Array of opportunity records
 * @returns Calculated pipeline statistics with stage-level breakdowns
 */
// export function calculatePipelineStats(
// 	pipelines: Pipeline[],
// 	opportunities: OpportunityData[]
// ): PipelineStatsResult {
// 	const pipelineStats = pipelines.map((pipeline) => {
// 		// Filter opportunities for this specific pipeline
// 		const pipelineOpportunities = opportunities.filter(
// 			(opp) => opp.pipelineId === pipeline.id
// 		);

// 		// Calculate statistics for each stage
// 		const stages = pipeline.stages.map((stage): CalculatedStage => {
// 			const stageOpportunities = pipelineOpportunities.filter(
// 				(opp) => opp.stageId === stage.id
// 			);

// 			const totalValue = stageOpportunities.reduce(
// 				(sum, opp) => sum + (opp.monetaryValue || 0),
// 				0
// 			);

// 			return {
// 				stageId: stage.id,
// 				stageName: stage.name,
// 				position: stage.position,
// 				opportunityCount: stageOpportunities.length,
// 				totalValue,
// 				averageValue:
// 					stageOpportunities.length > 0
// 						? totalValue / stageOpportunities.length
// 						: 0,
// 				opportunities: stageOpportunities.map((opp) => ({
// 					id: opp.id,
// 					name: opp.name,
// 					monetaryValue: opp.monetaryValue || 0,
// 					status: opp.status,
// 					dateAdded: opp.dateAdded,
// 				})),
// 			};
// 		});

// 		// Calculate pipeline totals
// 		const totalOpportunities = pipelineOpportunities.length;
// 		const totalValue = pipelineOpportunities.reduce(
// 			(sum, opp) => sum + (opp.monetaryValue || 0),
// 			0
// 		);

// 		return {
// 			id: pipeline.id,
// 			name: pipeline.name,
// 			totalOpportunities,
// 			totalValue,
// 			stages: stages.sort((a, b) => a.position - b.position), // Ensure proper ordering
// 		};
// 	});

// 	// Calculate overall totals
// 	const totalOpportunities = opportunities.length;
// 	const totalValue = opportunities.reduce(
// 		(sum, opp) => sum + (opp.monetaryValue || 0),
// 		0
// 	);

// 	return {
// 		pipelines: pipelineStats,
// 		totalOpportunities,
// 		totalValue,
// 	};
// }
export function calculatePipelineStats(
	pipelines: Pipeline[],
	opportunities: OpportunityData[]
): PipelineStatsResult {
	const pipelineStats = pipelines.map((pipeline) => {
		// Filter opportunities for this specific pipeline
		const pipelineOpportunities = opportunities.filter(
			(opp) => opp.pipelineId === pipeline.id
		);

		// Calculate statistics for each stage
		const stages = pipeline.stages.map((stage): CalculatedStage => {
			const stageOpportunities = pipelineOpportunities.filter(
				// FIXED: Use pipelineStageId (primary) or fallback to stageId
				(opp) => (opp.pipelineStageId || opp.stageId) === stage.id
			);

			const totalValue = stageOpportunities.reduce(
				(sum, opp) => sum + (opp.monetaryValue || 0),
				0
			);

			return {
				stageId: stage.id,
				stageName: stage.name,
				position: stage.position,
				opportunityCount: stageOpportunities.length,
				totalValue,
				averageValue:
					stageOpportunities.length > 0
						? totalValue / stageOpportunities.length
						: 0,
				opportunities: stageOpportunities.map((opp) => ({
					id: opp.id,
					name: opp.name,
					monetaryValue: opp.monetaryValue || 0,
					status: opp.status,
					dateAdded: opp.createdAt || opp.dateAdded, // FIXED: Use createdAt if available
				})),
			};
		});

		// Calculate pipeline totals
		const totalOpportunities = pipelineOpportunities.length;
		const totalValue = pipelineOpportunities.reduce(
			(sum, opp) => sum + (opp.monetaryValue || 0),
			0
		);

		return {
			id: pipeline.id,
			name: pipeline.name,
			totalOpportunities,
			totalValue,
			stages: stages.sort((a, b) => a.position - b.position), // Ensure proper ordering
		};
	});

	// Calculate overall totals
	const totalOpportunities = opportunities.length;
	const totalValue = opportunities.reduce(
		(sum, opp) => sum + (opp.monetaryValue || 0),
		0
	);

	return {
		pipelines: pipelineStats,
		totalOpportunities,
		totalValue,
	};
}

/**
 * Calculate conversion rates between pipeline stages
 * @param pipeline - Calculated pipeline data
 * @returns Array of conversion rates between consecutive stages
 */
export function calculateConversionRates(pipeline: CalculatedPipeline): Array<{
	fromStage: string;
	toStage: string;
	conversionRate: number;
	dropoffCount: number;
}> {
	const sortedStages = pipeline.stages.sort((a, b) => a.position - b.position);
	const conversionRates = [];

	for (let i = 0; i < sortedStages.length - 1; i++) {
		const currentStage = sortedStages[i];
		const nextStage = sortedStages[i + 1];

		const conversionRate =
			currentStage.opportunityCount > 0
				? (nextStage.opportunityCount / currentStage.opportunityCount) * 100
				: 0;

		const dropoffCount =
			currentStage.opportunityCount - nextStage.opportunityCount;

		conversionRates.push({
			fromStage: currentStage.stageName,
			toStage: nextStage.stageName,
			conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
			dropoffCount: Math.max(0, dropoffCount), // Ensure non-negative
		});
	}

	return conversionRates;
}

/**
 * Calculate stage velocity (average time spent in each stage)
 * @param opportunities - Opportunities with stage change history
 * @returns Average days spent in each stage
 */
export function calculateStageVelocity(
	opportunities: Array<
		OpportunityData & {
			stageHistory?: Array<{
				stageId: string;
				enteredAt: string;
				exitedAt?: string;
			}>;
		}
	>
): Record<string, number> {
	const stageVelocity: Record<string, { totalDays: number; count: number }> =
		{};

	opportunities.forEach((opp) => {
		if (!opp.stageHistory) return;

		opp.stageHistory.forEach((history) => {
			if (!history.exitedAt) return; // Skip current stage

			const enteredAt = new Date(history.enteredAt);
			const exitedAt = new Date(history.exitedAt);
			const daysInStage =
				(exitedAt.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24);

			if (!stageVelocity[history.stageId]) {
				stageVelocity[history.stageId] = { totalDays: 0, count: 0 };
			}

			stageVelocity[history.stageId].totalDays += daysInStage;
			stageVelocity[history.stageId].count += 1;
		});
	});

	// Calculate averages
	const averageVelocity: Record<string, number> = {};
	Object.keys(stageVelocity).forEach((stageId) => {
		const data = stageVelocity[stageId];
		averageVelocity[stageId] = data.count > 0 ? data.totalDays / data.count : 0;
	});

	return averageVelocity;
}

/**
 * Filter opportunities by date range
 * @param opportunities - Array of opportunities
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Filtered opportunities within date range
 */
export function filterOpportunitiesByDateRange(
	opportunities: OpportunityData[],
	startDate: string,
	endDate: string
): OpportunityData[] {
	const start = new Date(startDate);
	const end = new Date(endDate);

	return opportunities.filter((opp) => {
		const oppDate = new Date(opp.dateAdded);
		return oppDate >= start && oppDate <= end;
	});
}

/**
 * Filter opportunities by value threshold
 * @param opportunities - Array of opportunities
 * @param minValue - Minimum monetary value
 * @param maxValue - Maximum monetary value (optional)
 * @returns Filtered opportunities within value range
 */
export function filterOpportunitiesByValue(
	opportunities: OpportunityData[],
	minValue: number,
	maxValue?: number
): OpportunityData[] {
	return opportunities.filter((opp) => {
		const value = opp.monetaryValue || 0;
		const meetsMin = value >= minValue;
		const meetsMax = maxValue === undefined || value <= maxValue;
		return meetsMin && meetsMax;
	});
}

/**
 * Get opportunities by stage
 * @param opportunities - Array of opportunities
 * @param stageId - Stage ID to filter by
 * @returns Opportunities in the specified stage
 */
export function getOpportunitiesByStage(
	opportunities: OpportunityData[],
	stageId: string
): OpportunityData[] {
	return opportunities.filter((opp) => opp.stageId === stageId);
}

/**
 * Calculate pipeline health score based on various metrics
 * @param pipeline - Calculated pipeline data
 * @returns Health score (0-100) with breakdown
 */
export function calculatePipelineHealthScore(pipeline: CalculatedPipeline): {
	score: number;
	breakdown: {
		distribution: number; // How evenly distributed opportunities are
		velocity: number; // How quickly opportunities move through
		conversion: number; // Overall conversion effectiveness
	};
} {
	if (pipeline.totalOpportunities === 0) {
		return {
			score: 0,
			breakdown: { distribution: 0, velocity: 0, conversion: 0 },
		};
	}

	// Distribution score (penalize stages with 0 opportunities)
	const stagesWithOpps = pipeline.stages.filter(
		(stage) => stage.opportunityCount > 0
	).length;
	const distributionScore = (stagesWithOpps / pipeline.stages.length) * 100;

	// Conversion score (based on how many stages have reasonable conversion)
	const conversionRates = calculateConversionRates(pipeline);
	const goodConversions = conversionRates.filter(
		(rate) => rate.conversionRate >= 30
	).length;
	const conversionScore =
		conversionRates.length > 0
			? (goodConversions / conversionRates.length) * 100
			: 50; // Neutral score if no conversion data

	// Velocity score (placeholder - would need stage history data)
	const velocityScore = 75; // Placeholder value

	const overallScore = Math.round(
		distributionScore * 0.4 + conversionScore * 0.4 + velocityScore * 0.2
	);

	return {
		score: Math.min(100, Math.max(0, overallScore)),
		breakdown: {
			distribution: Math.round(distributionScore),
			velocity: Math.round(velocityScore),
			conversion: Math.round(conversionScore),
		},
	};
}

/**
 * Format currency value consistently across the application
 * @param value - Numeric value to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
	value: number,
	currency: string = "USD"
): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

/**
 * Calculate percentage with safe division
 * @param numerator - Top number
 * @param denominator - Bottom number
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Percentage value
 */
export function calculatePercentage(
	numerator: number,
	denominator: number,
	decimalPlaces: number = 1
): number {
	if (denominator === 0) return 0;
	return (
		Math.round((numerator / denominator) * 100 * Math.pow(10, decimalPlaces)) /
		Math.pow(10, decimalPlaces)
	);
}

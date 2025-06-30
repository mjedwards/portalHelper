/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	BulkFetchResponse,
	PipelineData,
	PipelineStageWithData,
} from "@/app/types/pipeline";
import GhlService from "@/utils/api/ghlService";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST endpoint for bulk opportunity fetching and pipeline organization
 * Uses the existing GHL service method that already does everything correctly
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { locationId, selectedPipelineId } = body;

		console.log("🔄 Starting bulk fetch for locationId:", locationId);
		console.log("🎯 Selected pipeline:", selectedPipelineId || "All pipelines");

		if (!locationId) {
			return NextResponse.json(
				{ error: "locationId is required" },
				{ status: 400 }
			);
		}

		// Use your existing method that already does everything correctly!
		console.log("🚀 Using getPipelineStatisticsComplete method...");

		const statisticsResult = await GhlService.getPipelineStatisticsComplete(
			locationId,
			{
				onProgress: (current, total) => {
					console.log(`📊 Progress: ${current}/${total} opportunities`);
				},
			}
		);

		console.log(
			`✅ Statistics complete: ${statisticsResult.totalOpportunities} total opportunities`
		);

		// Transform and filter pipelines
		const processedPipelines = statisticsResult.pipelines
			.map((pipeline) => {
				// If a specific pipeline is selected, filter to only that pipeline
				if (selectedPipelineId && pipeline.id !== selectedPipelineId) {
					return null;
				}

				// Transform stages to match PipelineStageWithData interface
				const enrichedStages = pipeline.stages.map(
					(stage: any): PipelineStageWithData => ({
						// Ensure all required PipelineStage properties
						id: stage.stageId,
						name: stage.stageName,
						position: stage.position,
						showInFunnel: true,
						showInPieChart: true,
						originId: undefined, // Optional

						// Ensure all required PipelineStageWithData properties
						opportunities: stage.opportunities || [], // Ensure it's always an array
						totalValue: stage.totalValue || 0, // Ensure it's always a number
						count: stage.opportunityCount || 0, // Ensure it's always a number
					})
				);

				// Ensure all required PipelineData properties
				const pipelineData: PipelineData = {
					id: pipeline.id, // REQUIRED
					name: pipeline.name, // REQUIRED
					dateAdded: new Date().toISOString(), // REQUIRED
					dateUpdated: new Date().toISOString(), // REQUIRED
					stages: enrichedStages, // REQUIRED
					totalOpportunities: pipeline.totalOpportunities || 0, // REQUIRED
					totalValue: pipeline.totalValue || 0, // REQUIRED

					// Optional properties
					originId: undefined,
					showInFunnel: true,
					showInPieChart: true,
				};

				return pipelineData;
			})
			.filter((pipeline): pipeline is PipelineData => pipeline !== null);

		// FIXED: Calculate overall stats (cleaner without optional chaining)
		const overallStats = {
			totalOpportunities: selectedPipelineId
				? processedPipelines.reduce(
						(sum: any, p: any) => sum + p.totalOpportunities,
						0
				  )
				: statisticsResult.totalOpportunities,
			totalValue: selectedPipelineId
				? processedPipelines.reduce((sum: any, p: any) => sum + p.totalValue, 0)
				: statisticsResult.totalValue,
			totalPipelines: processedPipelines.length,
			avgOpportunitiesPerPipeline:
				processedPipelines.length > 0
					? Math.round(
							processedPipelines.reduce(
								(sum: any, p: any) => sum + p.totalOpportunities,
								0
							) / processedPipelines.length
					  )
					: 0,
		};

		// Return formatted response
		const result: BulkFetchResponse = {
			success: true,
			pipelines: processedPipelines,
			overallStats,
			meta: {
				mode: "complete",
				totalFetched: statisticsResult.meta.totalFetched,
				totalEstimated: statisticsResult.meta.totalFetched,
				pageCount: statisticsResult.meta.pageCount,
				duration: statisticsResult.meta.duration,
				complete: true,
				lastUpdated: statisticsResult.meta.lastUpdated,
				selectedPipelineId: selectedPipelineId || null,
			},
			error: "",
		};

		console.log("✅ Bulk fetch and processing completed successfully");

		// FIXED: Log stage distribution for debugging (no any types)
		processedPipelines.forEach((pipeline: any) => {
			console.log(
				`📈 Pipeline "${pipeline.name}":`,
				pipeline.stages
					.map(
						(stage: any) =>
							`${stage.name}: ${
								stage.count
							} opportunities ($${stage.totalValue.toLocaleString()})`
					)
					.join(", ")
			);
		});

		return NextResponse.json(result);
	} catch (error: any) {
		console.error("❌ Bulk fetch failed:", error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || "Failed to fetch and process opportunities",
				details: {
					message: error.message,
					code: error.code || "BULK_FETCH_ERROR",
					timestamp: new Date().toISOString(),
					stack:
						process.env.NODE_ENV === "development" ? error.stack : undefined,
				},
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json(
		{
			error: "Method not allowed",
			message: "Use POST method for bulk fetch operations",
		},
		{ status: 405 }
	);
}

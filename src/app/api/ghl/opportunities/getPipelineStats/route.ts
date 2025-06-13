/* eslint-disable @typescript-eslint/no-explicit-any */
import GhlService from "@/utils/api/ghlService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		console.log("reached here");
		const { searchParams } = new URL(request.url);
		const locationId = searchParams.get("locationId");

		if (!locationId) {
			return NextResponse.json(
				{ error: "Location ID is required" },
				{ status: 400 }
			);
		}

		console.log(
			`🔄 API Route - Fetching pipeline statistics for location: ${locationId}`
		);

		// Fetch both pipelines and opportunities
		const [pipelinesResponse, opportunitiesResponse] = await Promise.all([
			GhlService.getOpportunityPipelines(locationId),
			GhlService.getOpportunities(locationId, { limit: 100 }),
		]);

		// Process the data to create statistic s
		const pipelineStats = pipelinesResponse.pipelines.map((pipeline) => {
			const pipelineOpportunities = opportunitiesResponse.opportunities.filter(
				(opp) => opp.pipelineId === pipeline.id
			);

			const stages = pipeline.stages.map((stage: any) => {
				const stageOpportunities = pipelineOpportunities.filter(
					(opp) => opp.stageId === stage.id
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
						// contactName: opp.contact?.name,
						dateAdded: opp.dateAdded,
					})),
				};
			});

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
				stages,
			};
		});

		const response = {
			pipelines: pipelineStats,
			totalOpportunities: opportunitiesResponse.opportunities.length,
			totalValue: opportunitiesResponse.opportunities.reduce(
				(sum, opp) => sum + (opp.monetaryValue || 0),
				0
			),
		};

		console.log(
			`✅ API Route - Successfully calculated stats for ${pipelineStats.length} pipelines`
		);

		return NextResponse.json(response);
	} catch (error) {
		console.error("❌ API Route - Error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch pipeline statistics",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

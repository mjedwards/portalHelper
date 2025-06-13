export interface StageStatistics {
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
    contactName?: string;
    dateAdded: string;
  }>;
}

export interface PipelineStatistics {
  id: string;
  name: string;
  totalOpportunities: number;
  totalValue: number;
  stages: StageStatistics[];
}

export interface PipelineStatsResponse {
  pipelines: PipelineStatistics[];
  totalOpportunities: number;
  totalValue: number;
}
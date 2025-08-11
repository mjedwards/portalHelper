export interface AgentProfile {
	id: string;
	name: string;
	tonePreference: "tough" | "soft" | "neutral";
	lastTraining: string;
	strengths: string[];
	improvementAreas: string[];
}

export interface AgentMetrics {
	placementRate: number;
	chargebacks: number;
	dailyDials: number;
	talkTime: number;
	bookedAppointments: number;
	closedAppointments: number;
	missedFollowups: number;
	netPremium: number;
	lastUpdated: Date;
}

export interface RoleplaySession {
	id: string;
	objectionType: string;
	agentResponse: string;
	uplineScore: number;
	feedback: string;
	improvements: string[];
	completedAt: Date;
}

export interface UplineMessage {
	id: string;
	role: "user" | "upline";
	content: string;
	type: "coaching" | "roleplay" | "motivation" | "training";
	timestamp: Date;
	metadata?: {
		score?: number;
		objectionType?: string;
		kpiTrigger?: string;
	};
}

export interface CoachingContext {
	agent: AgentProfile;
	metrics: AgentMetrics;
	recentSessions: RoleplaySession[];
	currentFocus: string[];
}

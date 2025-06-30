/* src/utils/constants/pipeline.ts */
export const PIPELINE_STAGE_COLORS = [
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
] as const;

export const PIPELINE_STATUS_COLORS = {
	open: "bg-blue-500",
	won: "bg-green-500",
	lost: "bg-red-500",
	abandoned: "bg-gray-500",
} as const;

export const DEFAULT_PAGINATION_LIMIT = 100;
export const MAX_PAGINATION_LIMIT = 1000;
export const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

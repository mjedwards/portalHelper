import React from "react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";

interface GoalProgressIndicatorProps {
	activityId: string;
}

const GoalProgressIndicator: React.FC<GoalProgressIndicatorProps> = ({
	activityId,
}) => {
	const { activityCounts, goals, currentTimeFrame } = useActivityTracker();

	const currentValue = activityCounts[activityId] || 0;
	const goalValue = goals[activityId]?.[currentTimeFrame] || 0;

	// If no goal is set, don't show the indicator
	if (!goalValue) return null;

	const progress = Math.min(100, (currentValue / goalValue) * 100);

	// Determine color based on progress
	let progressColor = "bg-red-500"; // < 50%
	if (progress >= 90) {
		progressColor = "bg-green-500"; // >= 90%
	} else if (progress >= 50) {
		progressColor = "bg-yellow-500"; // >= 50%
	}

	return (
		<div className='mt-2'>
			<div className='flex justify-between text-xs text-gray-500 mb-1'>
				<span>{`${currentValue} / ${goalValue}`}</span>
				<span>{`${Math.round(progress)}%`}</span>
			</div>
			<div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
				<div
					className={`h-full ${progressColor} transition-all duration-300`}
					style={{ width: `${progress}%` }}></div>
			</div>
		</div>
	);
};

export default GoalProgressIndicator;

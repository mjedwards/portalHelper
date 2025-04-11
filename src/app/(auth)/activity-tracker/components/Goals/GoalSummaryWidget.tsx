import React from "react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";

const GoalSummaryWidget: React.FC = () => {
	const { activityCounts, goals, currentTimeFrame } = useActivityTracker();

	// Get all activities with goals
	const activitiesWithGoals = Object.keys(goals || {}).filter(
		(activityId) => goals?.[activityId]?.[currentTimeFrame] > 0
	);

	// No goals set
	if (activitiesWithGoals.length === 0) {
		return (
			<div className='bg-white rounded-lg shadow-md p-4'>
				<h2 className='text-lg font-semibold mb-2 text-black'>Goal Summary</h2>
				<p className='text-gray-500 text-center py-6'>
					You haven&apos;t set any goals yet. Click &quot;Set Goals&quot; to get
					started.
				</p>
			</div>
		);
	}

	// Calculate overall progress
	const totalProgress =
		activitiesWithGoals.reduce((acc, activityId) => {
			const currentValue = activityCounts[activityId] || 0;
			const goalValue = goals[activityId]?.[currentTimeFrame] || 0;
			const progress = goalValue ? (currentValue / goalValue) * 100 : 0;
			return acc + progress;
		}, 0) / activitiesWithGoals.length;

	// Count completed goals
	const completedGoals = activitiesWithGoals.filter((activityId) => {
		const currentValue = activityCounts[activityId] || 0;
		const goalValue = goals[activityId]?.[currentTimeFrame] || 0;
		return currentValue >= goalValue;
	}).length;

	// Determine color based on overall progress
	let progressColor = "bg-red-500"; // < 50%
	if (totalProgress >= 90) {
		progressColor = "bg-green-500"; // >= 90%
	} else if (totalProgress >= 50) {
		progressColor = "bg-yellow-500"; // >= 50%
	}

	return (
		<div className='bg-white rounded-lg shadow-md p-4'>
			<h2 className='text-lg font-semibold mb-4 text-black'>Goal Summary</h2>

			<div className='mb-4'>
				<div className='flex justify-between text-sm mb-1'>
					<span className='text-black'>Overall Progress</span>
					<span>{Math.round(totalProgress)}%</span>
				</div>
				<div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
					<div
						className={`h-full ${progressColor} transition-all duration-300`}
						style={{ width: `${totalProgress}%` }}></div>
				</div>
			</div>

			<div className='grid grid-cols-2 gap-4 text-center'>
				<div className='bg-gray-50 p-3 rounded-md'>
					<div className='text-3xl font-bold text-blue-600'>
						{completedGoals}
					</div>
					<div className='text-sm text-gray-600'>Goals Completed</div>
				</div>

				<div className='bg-gray-50 p-3 rounded-md'>
					<div className='text-3xl font-bold text-blue-600'>
						{activitiesWithGoals.length}
					</div>
					<div className='text-sm text-gray-600'>Total Goals</div>
				</div>
			</div>
		</div>
	);
};

export default GoalSummaryWidget;

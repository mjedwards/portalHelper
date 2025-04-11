import React, { useState } from "react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";
import { Activity } from "../../types";

type TimeFrame = "day" | "week" | "month" | "year";

interface GoalSettingModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({
	isOpen,
	onClose,
}) => {
	const { layout, goals, setGoal } = useActivityTracker();
	const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>("day");

	// Get all active activities from the layout
	const activeActivities = Object.values(layout).flatMap(
		(category) => category.activities
	);

	// Get unique metrics being tracked (no duplicates)
	const uniqueActivities = Array.from(
		new Map(
			activeActivities.map((activity) => [activity.id, activity])
		).values()
	);

	const timeFrames: { value: TimeFrame; label: string }[] = [
		{ value: "day", label: "Daily Goals" },
		{ value: "week", label: "Weekly Goals" },
		{ value: "month", label: "Monthly Goals" },
		{ value: "year", label: "Yearly Goals" },
	];

	const handleGoalChange = (activityId: string, value: string) => {
		const numericValue = parseInt(value, 10);
		if (!isNaN(numericValue) && numericValue >= 0) {
			setGoal(activityId, activeTimeFrame, numericValue);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
				<div className='p-4 border-b flex justify-between items-center'>
					<h2 className='text-xl font-semibold text-black'>Goal Settings</h2>
					<button
						onClick={onClose}
						className='text-gray-500 hover:text-gray-700'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<path d='M18 6L6 18M6 6l12 12' />
						</svg>
					</button>
				</div>

				{/* Time Frame Tabs */}
				<div className='bg-gray-50 border-b'>
					<div className='flex overflow-x-auto'>
						{timeFrames.map((timeFrame) => (
							<button
								key={timeFrame.value}
								className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
									activeTimeFrame === timeFrame.value
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-600 hover:text-gray-900"
								}`}
								onClick={() => setActiveTimeFrame(timeFrame.value)}>
								{timeFrame.label}
							</button>
						))}
					</div>
				</div>

				{/* Goals Form */}
				<div className='p-4 overflow-y-auto flex-grow'>
					{uniqueActivities.length === 0 ? (
						<p className='text-gray-500 text-center py-8'>
							You are not tracking any activities yet. Add activities to set
							goals.
						</p>
					) : (
						<div className='space-y-4'>
							{uniqueActivities.map((activity) => (
								<GoalInput
									key={activity.id}
									activity={activity}
									timeFrame={activeTimeFrame}
									currentGoal={goals[activity.id]?.[activeTimeFrame] || 0}
									onChange={(value) => handleGoalChange(activity.id, value)}
								/>
							))}
						</div>
					)}
				</div>

				<div className='p-4 border-t flex justify-end'>
					<button
						onClick={onClose}
						className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'>
						Done
					</button>
				</div>
			</div>
		</div>
	);
};

interface GoalInputProps {
	activity: Activity;
	timeFrame: TimeFrame;
	currentGoal: number;
	onChange: (value: string) => void;
}

const GoalInput: React.FC<GoalInputProps> = ({
	activity,
	timeFrame,
	currentGoal,
	onChange,
}) => {
	return (
		<div className='flex items-center justify-between p-3 border rounded-md bg-white'>
			<div>
				<h3 className='font-medium text-gray-800'>{activity.name}</h3>
				<p className='text-sm text-gray-500'>{activity.description}</p>
			</div>
			<div className='flex items-center'>
				<label htmlFor={`goal-${activity.id}-${timeFrame}`} className='sr-only'>
					Goal for {activity.name} ({timeFrame})
				</label>
				<input
					id={`goal-${activity.id}-${timeFrame}`}
					type='number'
					min='0'
					value={currentGoal}
					onChange={(e) => onChange(e.target.value)}
					className='w-20 p-2 border rounded-md text-right text-black'
				/>
			</div>
		</div>
	);
};

export default GoalSettingModal;

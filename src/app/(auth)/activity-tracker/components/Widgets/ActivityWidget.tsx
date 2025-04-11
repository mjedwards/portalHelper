// src/components/Widgets/ActivityWidget.tsx
import React, { useState, useEffect } from "react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";
import GoalProgressIndicator from "../Goals/GoalProgressIndicator";
import { TrashIcon } from "@heroicons/react/24/outline";

interface ActivityWidgetProps {
	activityId: string;
	name: string;
	description: string;
	value?: string;
	onDelete?: () => void;
}

const ActivityWidget: React.FC<ActivityWidgetProps> = ({
	activityId,
	name,
	description,
	value,
	onDelete,
}) => {
	const { activityCounts, setActivityValue, goals, currentTimeFrame } =
		useActivityTracker();

	const currentValue = activityCounts[activityId] || 0;
	const currentGoal = goals[activityId]?.[currentTimeFrame] || 0;

	// Explicitly check if value is a non-undefined string to determine if it's a calculated value
	const isCalculatedValue = value !== undefined;

	// Local state for the input field
	const [inputValue, setInputValue] = useState<string>(currentValue.toString());
	// Track if the value has changed to enable/disable the save button
	const [hasChanged, setHasChanged] = useState<boolean>(false);

	// Update local state when the global state changes
	useEffect(() => {
		if (!isCalculatedValue) {
			setInputValue(currentValue.toString());
			setHasChanged(false); // Reset change state when data is refreshed
		}
	}, [currentValue, isCalculatedValue]);

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Allow only numbers
		const newValue = e.target.value.replace(/[^0-9]/g, "");
		setInputValue(newValue);

		// Check if the value has changed
		setHasChanged(parseInt(newValue, 10) !== currentValue);
	};

	// Handle save button click
	const handleSave = () => {
		const newValue = parseInt(inputValue, 10) || 0;
		// Only update if value has changed
		if (newValue !== currentValue) {
			setActivityValue(activityId, newValue);
			setHasChanged(false); // Reset changed state after saving
		}
	};

	// Handle Enter key press
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && hasChanged) {
			handleSave();
		}
	};

	// For debugging
	console.log(
		`Widget ${activityId}: value=${value}, isCalculated=${isCalculatedValue}`
	);

	return (
		<div className='bg-white rounded-lg shadow p-4 relative'>
			{/* Delete button */}
			{onDelete && (
				<button
					className='absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors'
					onClick={onDelete}
					aria-label='Delete widget'>
					<TrashIcon className='h-5 w-5' />
				</button>
			)}

			<div className='flex justify-between items-start mb-2'>
				<div>
					<h3 className='text-lg font-semibold text-black'>{name}</h3>
					<p className='text-sm text-black'>{description}</p>
				</div>
			</div>

			{/* Goal progress indicator */}
			{currentGoal > 0 && !isCalculatedValue && (
				<div className='mb-3'>
					<GoalProgressIndicator activityId={activityId} />
				</div>
			)}

			{isCalculatedValue ? (
				// Display for calculated/ratio values (not directly editable)
				<div className='mt-4'>
					<div className='w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-center text-black text-2xl font-bold'>
						{value}
					</div>
				</div>
			) : (
				// Editable input for regular counter metrics
				<div className='flex items-center mt-2'>
					<div className='flex-1'>
						<input
							type='text'
							className='w-full px-3 py-2 border border-gray-300 rounded text-center text-black'
							value={inputValue}
							onChange={handleInputChange}
							onKeyPress={handleKeyPress}
							aria-label={`${name} value`}
						/>
					</div>
					<button
						className={`ml-2 px-4 py-2 ${
							hasChanged
								? "bg-blue-500 hover:bg-blue-600"
								: "bg-gray-300 cursor-not-allowed"
						} text-white rounded transition-colors`}
						onClick={handleSave}
						disabled={!hasChanged}>
						Save
					</button>
				</div>
			)}
		</div>
	);
};

export default ActivityWidget;

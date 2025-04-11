import React from "react";
import { useActivityTracker } from "../context/ActivityTrackerContext";

const TimeFrameSelector: React.FC = () => {
	const { currentTimeFrame, setCurrentTimeFrame } = useActivityTracker();

	const timeFrames = [
		{ value: "day", label: "Day" },
		{ value: "week", label: "Week" },
		{ value: "month", label: "Month" },
		{ value: "year", label: "Year" },
	] as const;

	return (
		<div className='flex space-x-2'>
			{timeFrames.map((timeFrame) => (
				<button
					key={timeFrame.value}
					className={`px-3 py-1 text-sm rounded-md ${
						currentTimeFrame === timeFrame.value
							? "bg-blue-100 text-blue-700"
							: "text-gray-600 hover:bg-gray-100"
					}`}
					onClick={() => setCurrentTimeFrame(timeFrame.value)}>
					{timeFrame.label}
				</button>
			))}
		</div>
	);
};

export default TimeFrameSelector;

import React from "react";
import { useActivityTracker } from "../context/ActivityTrackerContext";

const ViewToggle: React.FC = () => {
	const { viewMode, setViewMode } = useActivityTracker();

	return (
		<div className='flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit'>
			<button
				className={`px-3 py-2 rounded-md text-sm ${
					viewMode === "widgets"
						? "bg-white shadow-sm text-blue-600"
						: "text-gray-600 hover:text-gray-800"
				}`}
				onClick={() => setViewMode("widgets")}>
				Widgets
			</button>
			<button
				className={`px-3 py-2 rounded-md text-sm ${
					viewMode === "analytics"
						? "bg-white shadow-sm text-blue-600"
						: "text-gray-600 hover:text-gray-800"
				}`}
				onClick={() => setViewMode("analytics")}>
				Analytics
			</button>
			<button
				className={`px-3 py-2 rounded-md text-sm ${
					viewMode === "calendar"
						? "bg-white shadow-sm text-blue-600"
						: "text-gray-600 hover:text-gray-800"
				}`}
				onClick={() => setViewMode("calendar")}>
				Calendar
			</button>
		</div>
	);
};

export default ViewToggle;

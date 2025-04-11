// src/app/dashboard/components/Calendar/MiniCalendarWidget.tsx

import React, { useState } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import { TrashIcon } from "@heroicons/react/24/outline";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface MiniCalendarWidgetProps {
	widgetId: string;
	onDelete?: () => void;
}

const MiniCalendarWidget: React.FC<MiniCalendarWidgetProps> = ({
	widgetId,
	onDelete,
}) => {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [currentView, setCurrentView] = useState<View>("month");

	// Handle navigation (back/next buttons)
	const handleNavigation = (action: "PREV" | "NEXT" | "TODAY") => {
		const newDate = new Date(currentDate);

		if (action === "TODAY") {
			setCurrentDate(new Date());
			return;
		}

		const increment = action === "NEXT" ? 1 : -1;

		switch (currentView) {
			case "month":
				newDate.setMonth(newDate.getMonth() + increment);
				break;
			case "week":
				newDate.setDate(newDate.getDate() + 7 * increment);
				break;
			case "day":
				newDate.setDate(newDate.getDate() + increment);
				break;
			default:
				break;
		}

		setCurrentDate(newDate);
	};

	// Handle view change (day/week/month buttons)
	const handleViewChange = (newView: View) => {
		setCurrentView(newView);
	};

	return (
		<div className='bg-white rounded-lg shadow p-4 h-80 relative'>
			{/* Delete button */}
			{onDelete && (
				<button
					className='absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors'
					onClick={onDelete}
					aria-label='Delete widget'>
					<TrashIcon className='h-5 w-5' />
				</button>
			)}

			<h3 className='text-lg font-semibold mb-2'>Calendar</h3>

			<div className='flex justify-between mb-2'>
				{/* View selector buttons */}
				<div>
					<button
						className={`px-2 py-1 mr-1 rounded ${
							currentView === "day" ? "bg-blue-500 text-white" : "bg-gray-200"
						}`}
						onClick={() => handleViewChange("day")}>
						Day
					</button>
					<button
						className={`px-2 py-1 mr-1 rounded ${
							currentView === "week" ? "bg-blue-500 text-white" : "bg-gray-200"
						}`}
						onClick={() => handleViewChange("week")}>
						Week
					</button>
					<button
						className={`px-2 py-1 rounded ${
							currentView === "month" ? "bg-blue-500 text-white" : "bg-gray-200"
						}`}
						onClick={() => handleViewChange("month")}>
						Month
					</button>
				</div>

				{/* Navigation buttons */}
				<div>
					<button
						className='px-2 py-1 mr-1 bg-gray-200 rounded'
						onClick={() => handleNavigation("PREV")}>
						Back
					</button>
					<button
						className='px-2 py-1 mr-1 bg-gray-200 rounded'
						onClick={() => handleNavigation("TODAY")}>
						Today
					</button>
					<button
						className='px-2 py-1 bg-gray-200 rounded'
						onClick={() => handleNavigation("NEXT")}>
						Next
					</button>
				</div>
			</div>

			{/* The calendar component - using widgetId in the key */}
			<div className='h-48'>
				<Calendar
					localizer={localizer}
					events={[]}
					startAccessor='start'
					endAccessor='end'
					view={currentView}
					date={currentDate}
					onNavigate={(newDate) => setCurrentDate(newDate)}
					onView={(newView) => setCurrentView(newView)}
					toolbar={false}
					key={`calendar-${widgetId}`} // Using widgetId here to ensure unique instances
					components={{
						toolbar: () => null, // Hide default toolbar
					}}
				/>
			</div>
		</div>
	);
};

export default MiniCalendarWidget;

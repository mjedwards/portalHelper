"use client";

import React, { useState } from "react";
import { useActivityTracker } from "../context/ActivityTrackerContext";
import DashboardContainer from "./Dashboard/DashboardContainer";
import AnalyticsView from "./Analytics/AnalyticsView";
import CalendarView from "./Calendar/CalendarView";
import ViewToggle from "../ViewControls/ViewToggle";
import GoalSettingButton from "./Goals/GoalSettingButton";
import TimeFrameSelector from "../ViewControls/TimeFrameSelector";
import AddToCalendarNotification from "./Notifications/AddToCalendarNotification";
import AppointmentEventForm from "./Calendar/AppointmentEventForm";

const ActivityTrackerContent = () => {
	const { viewMode, addAppointment, removeAppointment } = useActivityTracker();
	const [showCalendarForm, setShowCalendarForm] = useState(false);

	const handleAddToCalendar = () => {
		setShowCalendarForm(true);
	};

	return (
		<div>
			<div className='flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6'>
				<h1 className='text-2xl font-bold'>Activity Tracker</h1>

				<div className='flex flex-wrap gap-3'>
					<TimeFrameSelector />
					<GoalSettingButton />
					<ViewToggle />
				</div>
			</div>

			{viewMode === "widgets" && <DashboardContainer />}

			{viewMode === "analytics" && <AnalyticsView />}

			{viewMode === "calendar" && <CalendarView />}

			{/* Add to Calendar Notification */}
			<AddToCalendarNotification onAddToCalendar={handleAddToCalendar} />

			{/* Quick Add Appointment Form from Notification */}
			{showCalendarForm && (
				<AppointmentEventForm
					isOpen={showCalendarForm}
					onClose={() => setShowCalendarForm(false)}
					onSave={addAppointment}
					onDelete={removeAppointment}
					event={null}
					timeSlot={{
						start: new Date(),
						end: new Date(Date.now() + 3600000), // 1 hour later
					}}
					mode='create'
				/>
			)}
		</div>
	);
};

export default ActivityTrackerContent;

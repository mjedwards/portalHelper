// src/app/(auth)/activity-tracker/components/Calendar/CalendarView.tsx

import React, { useState } from "react";
import AppointmentCalendar from "./AppointmentCalendar";
import AppointmentEventForm from "./AppointmentEventForm";
import { useActivityTracker } from "../../context/ActivityTrackerContext";

const CalendarView: React.FC = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { addAppointment, updateAppointment, removeAppointment } =
		useActivityTracker();
	const [showQuickAddForm, setShowQuickAddForm] = useState(false);

	const handleQuickAdd = () => {
		const now = new Date();
		const oneHourLater = new Date(now);
		oneHourLater.setHours(oneHourLater.getHours() + 1);

		setShowQuickAddForm(true);
	};

	return (
		<div className='bg-white rounded-lg shadow-md overflow-hidden'>
			<div className='p-4 border-b flex justify-between items-center'>
				<h2 className='text-xl font-semibold text-black'>
					Appointment Calendar
				</h2>
				<button
					onClick={handleQuickAdd}
					className='px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='16'
						height='16'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='mr-1'>
						<path d='M12 5v14M5 12h14' />
					</svg>
					Quick Add
				</button>
			</div>

			<AppointmentCalendar />

			{showQuickAddForm && (
				<AppointmentEventForm
					isOpen={showQuickAddForm}
					onClose={() => setShowQuickAddForm(false)}
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

export default CalendarView;

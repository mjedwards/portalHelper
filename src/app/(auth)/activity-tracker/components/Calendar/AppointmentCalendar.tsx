import React, { useState, useCallback, useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { useActivityTracker } from "../../context/ActivityTrackerContext";
import AppointmentEventForm from "./AppointmentEventForm";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

// Custom event types
interface AppointmentEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	type: "appointment" | "meeting" | "follow-up" | "presentation";
	clientName?: string;
	notes?: string;
	isRecurring?: boolean;
	recurringPattern?: {
		frequency: "daily" | "weekly" | "biweekly" | "monthly";
		endDate?: Date;
	};
}

const AppointmentCalendar: React.FC = () => {
	const {
		incrementActivity,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		activityCounts,
		appointments,
		addAppointment,
		removeAppointment,
		updateAppointment,
	} = useActivityTracker();
	const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(
		null
	);
	const [showEventForm, setShowEventForm] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit">("create");
	const [selectedSlot, setSelectedSlot] = useState<{
		start: Date;
		end: Date;
	} | null>(null);

	// Custom event styling
	const eventStyleGetter = (event: AppointmentEvent) => {
		let backgroundColor = "#3B82F6"; // Default blue-500

		switch (event.type) {
			case "meeting":
				backgroundColor = "#8B5CF6"; // Purple-500
				break;
			case "follow-up":
				backgroundColor = "#10B981"; // Green-500
				break;
			case "presentation":
				backgroundColor = "#F59E0B"; // Yellow-500
				break;
		}

		return {
			style: {
				backgroundColor,
				borderRadius: "4px",
				color: "white",
				border: "none",
				display: "block",
			},
		};
	};

	// Handle slot selection (clicking on calendar)
	const handleSelectSlot = useCallback(
		({ start, end }: { start: Date; end: Date }) => {
			setSelectedSlot({ start, end });
			setSelectedEvent(null);
			setFormMode("create");
			setShowEventForm(true);
		},
		[]
	);

	// Handle event selection (clicking on an existing event)
	const handleSelectEvent = useCallback((event: AppointmentEvent) => {
		setSelectedEvent(event);
		setSelectedSlot(null);
		setFormMode("edit");
		setShowEventForm(true);
	}, []);

	// Handle appointment creation/update
	const handleSaveAppointment = useCallback(
		(appointmentData: AppointmentEvent) => {
			if (formMode === "create") {
				addAppointment(appointmentData);
				incrementActivity("bookedAppointments");
			} else {
				updateAppointment(appointmentData.id, appointmentData);
			}
			setShowEventForm(false);
		},
		[formMode, addAppointment, updateAppointment, incrementActivity]
	);

	// Handle appointment deletion
	const handleDeleteAppointment = useCallback(
		(appointmentId: string) => {
			removeAppointment(appointmentId);
			setShowEventForm(false);
		},
		[removeAppointment]
	);

	// Default calendar view based on screen size
	const defaultView = useMemo(() => {
		return window.innerWidth < 768 ? Views.DAY : Views.WEEK;
	}, []);

	return (
		<div className='bg-white rounded-lg shadow-md p-4 h-[700px] flex flex-col'>
			<h2 className='text-lg font-semibold mb-4 text-black'>
				Appointment Calendar
			</h2>

			<div className='flex-grow relative'>
				<Calendar
					localizer={localizer}
					events={appointments}
					startAccessor='start'
					endAccessor='end'
					defaultView={defaultView}
					views={["month", "week", "day", "agenda"]}
					selectable
					onSelectSlot={handleSelectSlot}
					onSelectEvent={handleSelectEvent}
					eventPropGetter={eventStyleGetter}
					step={30} // 30 minute increments
					timeslots={2} // 2 slots per step (15 minute intervals)
					scrollToTime={moment().set("hour", 8).toDate()} // Scroll to 8am
					className='h-full'
				/>
			</div>

			{showEventForm && (
				<AppointmentEventForm
					isOpen={showEventForm}
					onClose={() => setShowEventForm(false)}
					onSave={handleSaveAppointment}
					onDelete={handleDeleteAppointment}
					event={selectedEvent}
					timeSlot={selectedSlot}
					mode={formMode}
				/>
			)}
		</div>
	);
};

export default AppointmentCalendar;

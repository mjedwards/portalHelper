import React from "react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";
import moment from "moment";

const UpcomingAppointmentsWidget: React.FC = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { appointments, viewMode, setViewMode } = useActivityTracker();

	// Get today's and tomorrow's date for filtering
	const today = moment().startOf("day");
	const tomorrow = moment().add(1, "day").startOf("day");
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const nextWeek = moment().add(7, "days").endOf("day");

	// Sort and filter appointments to show only upcoming ones
	const upcomingAppointments = appointments
		.filter((appt) => moment(appt.start).isAfter(today))
		.sort((a, b) => a.start.getTime() - b.start.getTime())
		.slice(0, 5); // Show only next 5 appointments

	// Group appointments by day
	const todayAppointments = upcomingAppointments.filter((appt) =>
		moment(appt.start).isSame(today, "day")
	);

	const tomorrowAppointments = upcomingAppointments.filter((appt) =>
		moment(appt.start).isSame(tomorrow, "day")
	);

	const futureAppointments = upcomingAppointments.filter((appt) =>
		moment(appt.start).isAfter(tomorrow, "day")
	);

	const handleViewAllAppointments = () => {
		setViewMode("calendar");
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-4'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-lg font-semibold text-black'>
					Upcoming Appointments
				</h2>
				<button
					onClick={handleViewAllAppointments}
					className='text-blue-500 text-sm hover:text-blue-700'>
					View All
				</button>
			</div>

			{upcomingAppointments.length === 0 ? (
				<p className='text-gray-500 text-center py-6'>
					No upcoming appointments scheduled.
				</p>
			) : (
				<div className='space-y-4'>
					{todayAppointments.length > 0 && (
						<div>
							<h3 className='text-sm font-medium text-gray-700 mb-2'>Today</h3>
							<div className='space-y-2'>
								{todayAppointments.map((appointment) => (
									<AppointmentItem
										key={appointment.id}
										appointment={appointment}
									/>
								))}
							</div>
						</div>
					)}

					{tomorrowAppointments.length > 0 && (
						<div>
							<h3 className='text-sm font-medium text-gray-700 mb-2'>
								Tomorrow
							</h3>
							<div className='space-y-2'>
								{tomorrowAppointments.map((appointment) => (
									<AppointmentItem
										key={appointment.id}
										appointment={appointment}
									/>
								))}
							</div>
						</div>
					)}

					{futureAppointments.length > 0 && (
						<div>
							<h3 className='text-sm font-medium text-gray-700 mb-2'>
								Upcoming
							</h3>
							<div className='space-y-2'>
								{futureAppointments.map((appointment) => (
									<AppointmentItem
										key={appointment.id}
										appointment={appointment}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

interface AppointmentItemProps {
	appointment: {
		id: string;
		title: string;
		start: Date;
		end: Date;
		type: string;
		clientName?: string;
	};
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ appointment }) => {
	// Get appointment time
	const startTime = moment(appointment.start).format("h:mm A");
	const endTime = moment(appointment.end).format("h:mm A");
	const dateFormatted = moment(appointment.start).format("MMM D");

	// Determine background color based on type
	let bgColor = "bg-blue-50";
	let textColor = "text-blue-800";
	let iconColor = "text-blue-500";

	switch (appointment.type) {
		case "meeting":
			bgColor = "bg-purple-50";
			textColor = "text-purple-800";
			iconColor = "text-purple-500";
			break;
		case "follow-up":
			bgColor = "bg-green-50";
			textColor = "text-green-800";
			iconColor = "text-green-500";
			break;
		case "presentation":
			bgColor = "bg-yellow-50";
			textColor = "text-yellow-800";
			iconColor = "text-yellow-500";
			break;
	}

	return (
		<div className={`p-3 rounded-md ${bgColor} ${textColor}`}>
			<div className='flex items-center'>
				<div
					className={`h-8 w-8 rounded-full flex items-center justify-center ${iconColor} mr-3`}>
					{appointment.type === "appointment" && (
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<path d='M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34' />
							<polygon points='18 2 22 6 12 16 8 16 8 12 18 2' />
						</svg>
					)}

					{appointment.type === "meeting" && (
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
							<circle cx='9' cy='7' r='4' />
							<path d='M23 21v-2a4 4 0 0 0-3-3.87' />
							<path d='M16 3.13a4 4 0 0 1 0 7.75' />
						</svg>
					)}

					{appointment.type === "follow-up" && (
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
						</svg>
					)}

					{appointment.type === "presentation" && (
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<rect x='2' y='3' width='20' height='14' rx='2' ry='2' />
							<line x1='8' y1='21' x2='16' y2='21' />
							<line x1='12' y1='17' x2='12' y2='21' />
						</svg>
					)}
				</div>

				<div>
					<div className='font-medium'>{appointment.title}</div>
					<div className='text-xs opacity-75'>
						{startTime} - {endTime} • {appointment.clientName || "No client"} •{" "}
						{dateFormatted}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UpcomingAppointmentsWidget;

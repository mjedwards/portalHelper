import { LayoutData } from "../types";

export const activityCategories: LayoutData = {
	contactActivities: {
		title: "Contact Activities",
		activities: [
			{
				id: "dials",
				name: "Dials",
				description: "Number of calls made",
				type: "counter",
			},
			{
				id: "hangups",
				name: "Hangups",
				description: "Calls ended prematurely",
				type: "counter",
			},
		],
	},
	appointmentStatus: {
		title: "Appointment Status",
		activities: [
			{
				id: "bookedAppointments",
				name: "Booked Appointments",
				description: "Successfully scheduled meetings",
				type: "counter",
			},
			{
				id: "missedAppointments",
				name: "Missed Appointments",
				description: "Missed scheduled appointments",
				type: "counter",
			},
			{
				id: "noShows",
				name: "No Shows",
				description: "Client did not attend appointment",
				type: "counter",
			},
		],
	},
	clientEngagement: {
		title: "Client Engagement",
		activities: [
			{
				id: "presentation",
				name: "Presentations",
				description: "Full presentations delivered",
				type: "counter",
			},
			{
				id: "activeFeedback",
				name: "Active Feedback",
				description: "Feedback received from clients",
				type: "counter",
			},
		],
	},
	financialMetrics: {
		title: "Financial Metrics",
		activities: [
			{
				id: "chargebacks",
				name: "Chargebacks",
				description: "Reversed transactions",
				type: "counter",
			},
		],
	},
};

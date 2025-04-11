// src/data/allAvailableWidgets.ts
import { Activity } from "../types";

export const allAvailableWidgets: Activity[] = [
	// Contact Activities
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
	{
		id: "contactsReached",
		name: "Contacts Reached",
		description: "Calls that resulted in a conversation",
		type: "counter",
	},

	// Appointment Status
	{
		id: "bookedAppointments",
		name: "Booked Appointments",
		description: "Successfully scheduled meetings",
		type: "counter",
	},
	{
		id: "missedAppointments",
		name: "Missed Appointments",
		description: "Agent missed scheduled appointments",
		type: "counter",
	},
	{
		id: "noShows",
		name: "No Shows",
		description: "Client did not attend appointment",
		type: "counter",
	},
	{
		id: "completedAppointments",
		name: "Completed Appointments",
		description: "Clients who attended the meeting",
		type: "counter",
	},

	// Client Engagement
	{
		id: "presentations",
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

	// Financial Metrics
	{
		id: "chargebacks",
		name: "Chargebacks",
		description: "Reversed transactions",
		type: "counter",
	},
	{
		id: "salesClosed",
		name: "Sales Closed",
		description: "Policies sold per appointment",
		type: "counter",
	},
	{
		id: "conversionRate",
		name: "Conversion Rate",
		description: "Sales ÷ Completed Appointments",
		type: "ratio",
	},

	// Additional widgets
	{
		id: "sales",
		name: "Sales",
		description: "Completed sales",
		type: "counter",
	},
	{
		id: "referrals",
		name: "Referrals",
		description: "New client referrals",
		type: "counter",
	},
	{
		id: "followUps",
		name: "Follow-ups",
		description: "Follow-up interactions",
		type: "counter",
	},
	// Calendar Widget
	{
		id: "miniCalendar",
		name: "Mini Calendar",
		description: "View your monthly calendar at a glance",
		type: "calendar",
	},
];

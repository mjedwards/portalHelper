import React from "react";
import { Activity } from "../../types/index";
import ActivityWidget from "../Widgets/ActivityWidget";
import MiniCalendarWidget from "../Calendar/MiniCalendarWidget";
import { useActivityTracker } from "../../context/ActivityTrackerContext";

interface WidgetFactoryProps {
	activity: Activity;
	categoryId: string;
}

const WidgetFactory: React.FC<WidgetFactoryProps> = ({
	activity,
	categoryId,
}) => {
	// Move all hook calls to the top level
	const { removeWidgetFromCategory, activityCounts } = useActivityTracker();

	const handleDeleteWidget = () => {
		removeWidgetFromCategory(categoryId, activity.id);
	};

	// Pre-calculate conversion rate if needed
	let conversionRateValue: string | undefined;
	if (activity.id === "conversionRate") {
		const sales = activityCounts.sales || 0;
		const appointments = activityCounts.completedAppointments || 0;
		const rate = appointments > 0 ? (sales / appointments) * 100 : 0;
		conversionRateValue = `${rate.toFixed(1)}%`;
	}

	// Render different widgets based on type
	switch (activity.type) {
		case "calendar":
			return (
				<MiniCalendarWidget
					widgetId={`${categoryId}-${activity.id}`}
					onDelete={handleDeleteWidget}
				/>
			);
		case "ratio":
			// Make sure we're explicitly providing the value prop
			return (
				<ActivityWidget
					activityId={activity.id}
					name={activity.name}
					description={activity.description}
					value={conversionRateValue} // Explicitly pass the calculated value
					onDelete={handleDeleteWidget}
				/>
			);
		case "counter":
		default:
			return (
				<ActivityWidget
					activityId={activity.id}
					name={activity.name}
					description={activity.description}
					onDelete={handleDeleteWidget}
				/>
			);
	}
};

export default WidgetFactory;

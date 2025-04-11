// src/app/activity-tracker/components/WidgetSelector.tsx
import React, { useState, useMemo } from "react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";
import { allAvailableWidgets } from "../../data/allAvailableWidgets";
import { Activity, Widget } from "../../types";

interface WidgetSelectorProps {
	categoryId: string;
	onClose: () => void;
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({
	categoryId,
	onClose,
}) => {
	const { addWidget, layout } = useActivityTracker();
	const [isDisabled, setIsDisabled] = useState(false);

	// Create a mapping from widget ID to widget type
	const widgetTypeMap: Record<string, string> = {
		// Map each widget ID to a type - update these to match your available widgets
		emails: "activity",
		calls: "activity",
		meetings: "activity",
		presentations: "activity",
		proposals: "activity",
		bookedAppointments: "activity",
		followUps: "activity",
		// Add mappings for all your widgets
	};

	// Filter available widgets to exclude those already added to this category
	const availableWidgets = useMemo(() => {
		const categoryWidgets = layout[categoryId];

		// If the category doesn't exist yet, all widgets are available
		if (!categoryWidgets) {
			return allAvailableWidgets;
		}

		// Collect all widget IDs that are already in this category
		const existingWidgetIds = new Set<string>();

		// Check activities array
		if (categoryWidgets.activities) {
			categoryWidgets.activities.forEach((activity: Activity) => {
				existingWidgetIds.add(activity.id);
			});
		}

		// Check widgets array
		if (categoryWidgets.widgets) {
			categoryWidgets.widgets.forEach((widget: Widget) => {
				existingWidgetIds.add(widget.id);
			});
		}

		// Filter out widgets that are already added
		return allAvailableWidgets.filter(
			(widget) => !existingWidgetIds.has(widget.id)
		);
	}, [layout, categoryId]);

	const handleAddWidget = (widgetId: string) => {
		// Prevent multiple rapid clicks
		if (isDisabled) return;
		setIsDisabled(true);

		// Find the widget to add
		const widgetToAdd = allAvailableWidgets.find(
			(widget) => widget.id === widgetId
		);

		if (!widgetToAdd) {
			setIsDisabled(false);
			return;
		}

		// Determine widget type (default to "activity" if not in map)
		const widgetType = widgetTypeMap[widgetId] || "activity";

		// Pass both widgetType AND widgetId to the addWidget function
		addWidget(categoryId, widgetType, widgetId);

		// Close the selector
		onClose();

		// Re-enable after delay
		setTimeout(() => {
			setIsDisabled(false);
		}, 1000);
	};

	return (
		<div className='absolute top-0 left-0 right-0 mt-10 bg-white border rounded-md shadow-lg z-10 p-3 max-h-64 overflow-y-auto'>
			<h3 className='font-medium text-gray-700 mb-2 pb-2 border-b'>
				Available Widgets
			</h3>
			{availableWidgets.length === 0 ? (
				<p className='text-gray-500 text-sm py-2'>
					No available widgets for this category
				</p>
			) : (
				<ul className='space-y-2'>
					{availableWidgets.map(
						(widget: { id: string; name: string; description: string }) => (
							<li key={widget.id}>
								<button
									onClick={() => handleAddWidget(widget.id)}
									disabled={isDisabled}
									className={`w-full text-left p-2 ${
										isDisabled
											? "opacity-50 cursor-not-allowed"
											: "hover:bg-gray-100"
									} rounded-md flex items-center`}>
									<span className='text-blue-500 mr-2'>+</span>
									<div>
										<div className='font-medium text-black'>{widget.name}</div>
										<div className='text-sm text-gray-500'>
											{widget.description}
										</div>
									</div>
								</button>
							</li>
						)
					)}
				</ul>
			)}
			<div className='mt-3 border-t pt-2 flex justify-end'>
				<button
					onClick={onClose}
					className='px-3 py-1 text-sm text-gray-700 hover:text-gray-900'>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default WidgetSelector;

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import DroppableSection from "../DragDrop/DroppableSection";
import DraggableWidget from "../DragDrop/DraggableWidget";
import WidgetFactory from "../Widgets/WidgetFactory";
import { activityCategories } from "../../data/activityCategories";
import { Activity, LayoutData } from "../../types";
import { useActivityTracker } from "../../context/ActivityTrackerContext";
import GoalSummaryWidget from "../Goals/GoalSummaryWidget";
import UpcomingAppointmentsWidget from "../Calendar/UpcomingAppointmentsWidget";

interface DashboardContainerProps {
	className?: string;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
	className,
}) => {
	const { layout, setLayout } = useActivityTracker();
	const [activeId, setActiveId] = useState<string | null>(null);

	// Find the currently active widget if there is one
	const activeWidget = activeId
		? Object.values(layout)
				.flatMap((category) => category.activities)
				.find((activity) => activity.id === activeId)
		: null;

	// Set up sensors for drag detection
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5, // Minimum drag distance before activation
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		setActiveId(null);

		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// If dropped over the same container it started in
		const activeContainerId = findContainerIdForWidget(activeId);
		const overContainerId = overId;

		if (!activeContainerId || !overContainerId) return;

		// Create a copy of our layout to modify
		const newLayout = { ...layout };

		// Find the source category and the index of the widget within it
		const sourceCategory = newLayout[activeContainerId];
		const sourceIndex = sourceCategory.activities.findIndex(
			(activity) => activity.id === activeId
		);

		// Get the widget that was moved
		const movedWidget = sourceCategory.activities[sourceIndex];

		// Remove from source category
		sourceCategory.activities.splice(sourceIndex, 1);

		// Add to destination category
		const destCategory = newLayout[overContainerId];
		destCategory.activities.push(movedWidget);

		setLayout(newLayout);
	};

	// Helper function to find which container a widget is in
	const findContainerIdForWidget = (widgetId: string): string | null => {
		for (const [containerId, container] of Object.entries(layout)) {
			if (container.activities.some((activity) => activity.id === widgetId)) {
				return containerId;
			}
		}
		return null;
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Fixed Widgets at the top */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<GoalSummaryWidget />
				<UpcomingAppointmentsWidget />
			</div>

			{/* DndContext for draggable widgets */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{Object.entries(layout).map(([categoryId, category]) => (
						<DroppableSection
							key={categoryId}
							id={categoryId}
							title={category.title}
							className='col-span-1'>
							<SortableContext
								items={category.activities.map((a) => a.id)}
								strategy={rectSortingStrategy}>
								{category.activities.map((activity) => (
									<DraggableWidget key={activity.id} id={activity.id}>
										<WidgetFactory
											activity={activity}
											categoryId={categoryId}
										/>
									</DraggableWidget>
								))}
							</SortableContext>
						</DroppableSection>
					))}
				</div>

				{/* Drag overlay for visual feedback during drag */}
				<DragOverlay>
					{activeId && activeWidget ? (
						<div className='opacity-80'>
							<WidgetFactory
								activity={activeWidget}
								categoryId={findContainerIdForWidget(activeId) || ""}
							/>
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
};

export default DashboardContainer;

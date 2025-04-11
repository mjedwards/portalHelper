// src/app/(auth)/activity-tracker/components/DragDrop/DraggableWidget.tsx

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableWidgetProps {
	id: string;
	children: React.ReactNode;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ id, children }) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: id,
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		opacity: isDragging ? 0.5 : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className='mb-3 touch-manipulation cursor-grab'>
			{children}
		</div>
	);
};

export default DraggableWidget;

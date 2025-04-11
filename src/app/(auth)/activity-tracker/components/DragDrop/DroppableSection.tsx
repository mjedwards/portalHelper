import React from "react";
import { useDroppable } from "@dnd-kit/core";
import AddWidgetButton from "../Widgets/AddWidgetButton";

interface DroppableSectionProps {
	id: string;
	title: string;
	children: React.ReactNode;
	className?: string;
}

const DroppableSection: React.FC<DroppableSectionProps> = ({
	id,
	title,
	children,
	className,
}) => {
	const { setNodeRef, isOver } = useDroppable({
		id: id,
	});

	return (
		<section className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
			<h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>
				{title}
			</h2>
			<div
				ref={setNodeRef}
				className={`min-h-[100px] transition-colors duration-200 ${
					isOver ? "bg-blue-50" : "bg-white"
				}`}>
				{children}
			</div>
			<div className='mt-4'>
				<AddWidgetButton categoryId={id} />
			</div>
		</section>
	);
};

export default DroppableSection;

import React from "react";
import WidgetFactory from "../Widgets/WidgetFactory";
// import AddWidgetButton from "../Widgets/AddWidgetButton";
import { useActivityTracker } from "../../context/ActivityTrackerContext";

interface CategorySectionProps {
	categoryId: string;
	title: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
	categoryId,
	title,
}) => {
	const { layout } = useActivityTracker();

	// Make sure widgets exists, otherwise use empty array
	const widgets = layout[categoryId]?.widgets || [];

	return (
		<div className='category-section p-4 bg-white rounded-lg shadow'>
			<h2 className='text-lg font-semibold mb-4'>{title}</h2>

			<div className='widgets-container space-y-4'>
				{/* Map over widgets */}
				{widgets.map((widget) => (
					<WidgetFactory
						key={widget.id}
						activity={{
							id: widget.id,
							name: widget.data?.name || widget.id,
							description: widget.data?.description || "",
							type: widget.type,
						}}
						categoryId={categoryId}
					/>
				))}
			</div>

			{/* <AddWidgetButton categoryId={categoryId} /> */}
		</div>
	);
};

export default CategorySection;

export interface Activity {
	id: string;
	name: string;
	description: string;
	type?: "counter" | "calendar" | "ratio" | string;
}

// Define a more specific WidgetData interface instead of using any
export interface WidgetData {
	name?: string;
	description?: string;
	color?: string;
	// Add other properties that your widgets might use
	[key: string]: string | number | boolean | undefined;
}

export interface Widget {
	id: string;
	type: string;
	data: WidgetData;
}

export interface Category {
	title: string;
	activities: Activity[];
	widgets: Widget[]; // Add this for the new widget structure
}

export interface LayoutData {
	[categoryId: string]: Category;
}

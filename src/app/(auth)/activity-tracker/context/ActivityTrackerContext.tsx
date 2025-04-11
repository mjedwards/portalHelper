import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useRef,
	useCallback
} from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Activity, LayoutData, Widget, WidgetData } from "../types";
import { activityCategories } from "../data/activityCategories";
import { allAvailableWidgets } from "../data/allAvailableWidgets";

type ActivityCounts = {
	[activityId: string]: number;
};

type TimeFrame = "day" | "week" | "month" | "year";

type GoalData = {
	[activityId: string]: {
		[timeFrame in TimeFrame]?: number;
	};
};

export interface AppointmentEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	type: "appointment" | "meeting" | "follow-up" | "presentation";
	clientName?: string;
	notes?: string;
	isRecurring?: boolean;
	recurringPattern?: {
		frequency: "daily" | "weekly" | "biweekly" | "monthly";
		endDate?: Date;
	};
}

interface ActivityTrackerContextType {
	layout: LayoutData;
	setLayout: React.Dispatch<React.SetStateAction<LayoutData>>;
	activityCounts: ActivityCounts;
	incrementActivity: (activityId: string, amount?: number) => void;
	decrementActivity: (activityId: string, amount?: number) => void;
	resetActivity: (activityId: string) => void;
	setActivityValue: (activityId: string, value: number) => void;
	goals: GoalData;
	setGoal: (activityId: string, timeFrame: TimeFrame, value: number) => void;
	currentTimeFrame: TimeFrame;
	setCurrentTimeFrame: (timeFrame: TimeFrame) => void;
	viewMode: "widgets" | "analytics" | "calendar";
	setViewMode: (mode: "widgets" | "analytics" | "calendar") => void;
	appointments: AppointmentEvent[];
	addAppointment: (appointment: AppointmentEvent) => void;
	updateAppointment: (id: string, updatedAppointment: AppointmentEvent) => void;
	removeAppointment: (id: string) => void;
	showAddToCalendarNotification: boolean;
	setShowAddToCalendarNotification: (show: boolean) => void;
	removeWidgetFromCategory: (categoryId: string, widgetId: string) => void;
	addWidget: (categoryId: string, widgetType: string, widgetId?: string) => void;
}

const ActivityTrackerContext = createContext<
	ActivityTrackerContextType | undefined
>(undefined);

export const useActivityTracker = () => {
	const context = useContext(ActivityTrackerContext);
	if (context === undefined) {
		throw new Error(
			"useActivityTracker must be used within an ActivityTrackerProvider"
		);
	}
	return context;
};

interface ActivityTrackerProviderProps {
	children: ReactNode;
}

// Flag to prevent multiple rapid executions of addWidget
let isAddingWidget = false;

// Track processed operations to prevent StrictMode double execution
const processedOperations = new Set<string>();

export const ActivityTrackerProvider: React.FC<
	ActivityTrackerProviderProps
> = ({ children }) => {
	// Layout state
	const [layout, setLayout] = useState<LayoutData>(() => {
		// Try to load from localStorage
		const savedLayout = localStorage.getItem("activityTrackerLayout");
		const initialLayout = savedLayout ? JSON.parse(savedLayout) : activityCategories;
		
		// Check for and fix duplicate widget IDs
		const allWidgetIds: string[] = [];
		const fixedLayout = {...initialLayout};
		
		Object.keys(fixedLayout).forEach(categoryId => {
			const category = fixedLayout[categoryId];
			
			// Make sure widgets array exists
			if (!category.widgets) {
				category.widgets = [];
			}
			
			// Check for duplicate IDs and fix them
			const updatedWidgets = category.widgets.map((widget: { id: string; }) => {
				if (allWidgetIds.includes(widget.id)) {
					// Generate a new unique ID by adding a timestamp suffix
					const newId = `${widget.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
					console.log(`Fixing duplicate widget ID: ${widget.id} -> ${newId}`);
					return { ...widget, id: newId };
				}
				
				allWidgetIds.push(widget.id);
				return widget;
			});
			
			category.widgets = updatedWidgets;
		});
		
		return fixedLayout;
	});

	// Activity counts - the data being tracked
	const [activityCounts, setActivityCounts] = useState<ActivityCounts>(() => {
		const savedCounts = localStorage.getItem("activityCounts");
		return savedCounts ? JSON.parse(savedCounts) : {};
	});

	// Goals for activities
	const [goals, setGoals] = useState<GoalData>(() => {
		const savedGoals = localStorage.getItem("activityGoals");
		return savedGoals ? JSON.parse(savedGoals) : {};
	});

	// Current time frame for view (day, week, month, year)
	const [currentTimeFrame, setCurrentTimeFrame] = useState<TimeFrame>("day");

	// View mode (widgets or analytics)
	const [viewMode, setViewMode] = useState<
		"widgets" | "analytics" | "calendar"
	>("widgets");

	// Save state to localStorage when it changes
	useEffect(() => {
		localStorage.setItem("activityTrackerLayout", JSON.stringify(layout));
	}, [layout]);

	useEffect(() => {
		localStorage.setItem("activityCounts", JSON.stringify(activityCounts));
	}, [activityCounts]);

	useEffect(() => {
		localStorage.setItem("activityGoals", JSON.stringify(goals));
	}, [goals]);

	// Initialize widget arrays for all categories
	useEffect(() => {
		// Ensure all categories have a widgets array
		setLayout(prevLayout => {
			const newLayout = JSON.parse(JSON.stringify(prevLayout));
			
			// Check each category and ensure it has a widgets array
			Object.keys(newLayout).forEach(categoryId => {
				if (!newLayout[categoryId].widgets) {
					newLayout[categoryId].widgets = [];
				}
			});
			
			return newLayout;
		});
	}, []); // Run only once on mount

	// Debug logging for layout changes
	useEffect(() => {
		// This effect will run every time the layout changes
		console.log('Layout changed!');
		
		// Check for any duplicate widget IDs
		const widgetIdMap = new Map();
		let hasDuplicates = false;
		
		Object.keys(layout).forEach(categoryId => {
			const category = layout[categoryId];
			
			if (category.widgets) {
				category.widgets.forEach(widget => {
					if (widgetIdMap.has(widget.id)) {
						console.error(`DUPLICATE WIDGET ID DETECTED: ${widget.id}`);
						console.error(`  - First instance in category: ${widgetIdMap.get(widget.id)}`);
						console.error(`  - Duplicate in category: ${categoryId}`);
						hasDuplicates = true;
					} else {
						widgetIdMap.set(widget.id, categoryId);
					}
				});
			}
		});
		
		if (!hasDuplicates) {
			console.log('No duplicate widget IDs found 👍');
		}
	}, [layout]);

	// Track processed operations for StrictMode protection
	const layoutUpdatesRef = useRef(new Set<string>());

	// Direct set activity value function
	const setActivityValue = (activityId: string, value: number) => {
		setActivityCounts((prev) => ({
			...prev,
			[activityId]: Math.max(0, value),
		}));

		// Show notification when directly setting booked appointments
		if (activityId === "bookedAppointments") {
			setShowAddToCalendarNotification(true);

			// Auto-hide notification after 5 seconds
			setTimeout(() => {
				setShowAddToCalendarNotification(false);
			}, 5000);
		}
	};

	const decrementActivity = (activityId: string, amount = 1) => {
		setActivityCounts((prev) => ({
			...prev,
			[activityId]: Math.max(0, (prev[activityId] || 0) - amount),
		}));
	};

	const resetActivity = (activityId: string) => {
		setActivityCounts((prev) => ({
			...prev,
			[activityId]: 0,
		}));
	};

	// Goal setting function
	const setGoal = (activityId: string, timeFrame: TimeFrame, value: number) => {
		setGoals((prev) => ({
			...prev,
			[activityId]: {
				...(prev[activityId] || {}),
				[timeFrame]: value,
			},
		}));
	};

	// Appointments state
	const [appointments, setAppointments] = useState<AppointmentEvent[]>(() => {
		const savedAppointments = localStorage.getItem("activityAppointments");
		if (savedAppointments) {
			// Parse the JSON and convert string dates back to Date objects
			const parsedAppointments = JSON.parse(savedAppointments);
			return parsedAppointments.map(
				(appt: {
					start: string;
					end: string;
					recurringPattern?: { endDate?: string };
				}) => ({
					...appt,
					start: new Date(appt.start),
					end: new Date(appt.end),
					recurringPattern: appt.recurringPattern
						? {
								...appt.recurringPattern,
								endDate: appt.recurringPattern.endDate
									? new Date(appt.recurringPattern.endDate)
									: undefined,
						  }
						: undefined,
				})
			);
		}
		return [];
	});

	// Notification state for adding to calendar
	const [showAddToCalendarNotification, setShowAddToCalendarNotification] =
		useState(false);

	// Save appointments to localStorage when they change
	useEffect(() => {
		localStorage.setItem("activityAppointments", JSON.stringify(appointments));
	}, [appointments]);

	// Override the incrementActivity function to show notification when booking appointments
	const incrementActivity = (activityId: string, amount = 1) => {
		setActivityCounts((prev) => ({
			...prev,
			[activityId]: (prev[activityId] || 0) + amount,
		}));

		// Show notification when booking appointments manually
		if (activityId === "bookedAppointments") {
			setShowAddToCalendarNotification(true);

			// Auto-hide notification after 5 seconds
			setTimeout(() => {
				setShowAddToCalendarNotification(false);
			}, 5000);
		}
	};

	// Appointment management functions
	const addAppointment = (appointment: AppointmentEvent) => {
		setAppointments((prev) => [...prev, appointment]);

		// Also increment the bookedAppointments counter but without triggering notification
		setActivityCounts((prev) => ({
			...prev,
			bookedAppointments: (prev.bookedAppointments || 0) + 1,
		}));
	};

	const updateAppointment = (
		id: string,
		updatedAppointment: AppointmentEvent
	) => {
		setAppointments((prev) =>
			prev.map((appointment) =>
				appointment.id === id ? updatedAppointment : appointment
			)
		);
	};

	const removeAppointment = (id: string) => {
		setAppointments((prev) =>
			prev.filter((appointment) => appointment.id !== id)
		);

		// Decrement the bookedAppointments counter
		decrementActivity("bookedAppointments");
	};

	// Function to generate unique widget IDs
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const generateUniqueWidgetId = (baseId: string, existingLayout: LayoutData): string => {
		// Create a unique ID using type + timestamp + random string for guaranteed uniqueness
		return `${baseId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	};

	// Updated addWidget function with support for both activities and widgets
	const addWidget = useCallback((categoryId: string, widgetType: string, widgetId?: string) => {
		// Generate a unique operation ID for this specific addWidget call
		const operationId = `add-${widgetType}-${categoryId}-${Date.now()}`;
		
		// Check if this exact operation was already processed (StrictMode protection)
		if (layoutUpdatesRef.current.has(operationId)) {
			console.log(`Prevented duplicate operation: ${operationId}`);
			return;
		}
		
		// Also check global processed operations
		if (processedOperations.has(operationId)) {
			console.log(`Prevented duplicate global operation: ${operationId}`);
			return;
		}
		
		// Prevent function from running if it's already in progress
		if (isAddingWidget) {
			console.log('Widget addition already in progress, preventing duplicate');
			return;
		}
		
		// Set flag to prevent multiple executions
		isAddingWidget = true;
		
		// Mark this operation as processed
		layoutUpdatesRef.current.add(operationId);
		processedOperations.add(operationId);
		
		// Set a timeout to clear this operation ID after a while
		setTimeout(() => {
			layoutUpdatesRef.current.delete(operationId);
			processedOperations.delete(operationId);
		}, 2000);
		
		console.log(`Adding widget of type ${widgetType} to category ${categoryId}`);
		
		setLayout(prevLayout => {
			// Create a deep copy of the previous layout
			const newLayout = JSON.parse(JSON.stringify(prevLayout));
			
			// If widgetId is provided, look up existing widget from allAvailableWidgets
			if (widgetId) {
				// This is the old approach for adding activities
				const widgetToAdd = allAvailableWidgets.find(
					(widget) => widget.id === widgetId
				);
				
				if (widgetToAdd) {
					if (!newLayout[categoryId]) {
						// Initialize a new category
						newLayout[categoryId] = { 
							title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
							activities: [],
							widgets: []
						};
					}
					
					// Add to activities array for backward compatibility
					if (!newLayout[categoryId].activities) {
						newLayout[categoryId].activities = [];
					}
					
					// Check if this widget ID already exists in this category
					const widgetExists = newLayout[categoryId].activities.some(
						(activity: Activity) => activity.id === widgetId
					);
					
					if (!widgetExists) {
						newLayout[categoryId].activities.push(widgetToAdd);
						console.log(`Added activity ${widgetId} to ${categoryId}`);
					} else {
						console.log(`Activity ${widgetId} already exists in ${categoryId}, skipping`);
					}
					
					return newLayout;
				}
			}
			
			// If no widgetId or widget not found, create a new widget (new approach)
			// Generate a unique ID for the new widget
			const uniqueWidgetId = generateUniqueWidgetId(widgetType, newLayout);
			
			// Create the new widget with the unique ID
			const newWidget: Widget = {
				id: uniqueWidgetId,
				type: widgetType,
				data: {
					name: widgetType.charAt(0).toUpperCase() + widgetType.slice(1),
					description: `New ${widgetType} widget`,
					createdAt: Date.now().toString()
				}
			};
			
			// Add the widget to the specified category
			if (!newLayout[categoryId]) {
				// Initialize a new category with both activities and widgets arrays
				newLayout[categoryId] = { 
					title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
					activities: [],
					widgets: []
				};
			}
			
			// Make sure widgets array exists
			if (!newLayout[categoryId].widgets) {
				newLayout[categoryId].widgets = [];
			}
			
			console.log(`Created widget with ID: ${uniqueWidgetId}`);
			newLayout[categoryId].widgets.push(newWidget);
			return newLayout;
		});
		
		// Reset the flag after a delay
		setTimeout(() => {
			isAddingWidget = false;
		}, 500);
	}, []);

	// New function to remove a widget from a category
	const removeWidgetFromCategory = useCallback((categoryId: string, widgetId: string) => {
		setLayout((prevLayout: LayoutData) => {
			// Create a deep copy of the layout
			const newLayout = JSON.parse(JSON.stringify(prevLayout)) as LayoutData;
	
			// Check if the category exists
			if (newLayout[categoryId]) {
				// Check if the widget is in activities
				const activityIndex = newLayout[categoryId].activities.findIndex(
					(activity: Activity) => activity.id === widgetId
				);
				
				if (activityIndex !== -1) {
					// Remove from activities
					newLayout[categoryId].activities.splice(activityIndex, 1);
					console.log(`Removed activity ${widgetId} from ${categoryId}`);
				} else {
					// Filter out the widget from widgets array
					newLayout[categoryId].widgets = newLayout[categoryId].widgets.filter(
						(widget) => widget.id !== widgetId
					);
					console.log(`Removed widget ${widgetId} from ${categoryId}`);
				}
			}
	
			return newLayout;
		});
	}, []);

	const value: ActivityTrackerContextType = {
		layout,
		setLayout,
		activityCounts,
		incrementActivity,
		decrementActivity,
		resetActivity,
		setActivityValue,
		goals,
		setGoal,
		currentTimeFrame,
		setCurrentTimeFrame,
		viewMode,
		setViewMode,
		appointments,
		addAppointment,
		updateAppointment,
		removeAppointment,
		showAddToCalendarNotification,
		setShowAddToCalendarNotification,
		removeWidgetFromCategory,
		addWidget,
	};

	return (
		<ActivityTrackerContext.Provider value={value}>
			{children}
		</ActivityTrackerContext.Provider>
	);
};
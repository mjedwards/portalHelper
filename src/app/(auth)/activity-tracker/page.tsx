"use client";

import React from "react";
import { ActivityTrackerProvider } from "./context/ActivityTrackerContext";
import ActivityTrackerContent from "./components/ActivityTrackerContent";

export default function ActivityTrackerPage() {
	return (
		<ActivityTrackerProvider>
			<div className='container mx-auto py-6 px-4'>
				<ActivityTrackerContent />
			</div>
		</ActivityTrackerProvider>
	);
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(auth)/dashboard/components/LocationSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the location interface based on your GHL location structure
interface GHLLocation {
	id?: string;
	locationId?: string;
	name: string;
	[key: string]: any;
}

export default function LocationSelector({
	currentLocationId,
}: {
	currentLocationId?: string;
}) {
	// Properly type the locations state
	const [locations, setLocations] = useState<GHLLocation[]>([]);
	const [selectedLocation, setSelectedLocation] = useState(
		currentLocationId || ""
	);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const response = await fetch("/api/ghl/locations");
				const data = await response.json();
				setLocations(data);
				setIsLoading(false);
			} catch (err) {
				console.error("Error fetching locations:", err);
				setIsLoading(false);
			}
		};

		// fetchLocations();
	}, []);

	// Update selected location when prop changes
	useEffect(() => {
		if (currentLocationId) {
			setSelectedLocation(currentLocationId);
		}
	}, [currentLocationId]);

	const handleLocationChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const newLocationId = e.target.value;
		setSelectedLocation(newLocationId);

		try {
			// Update default location via API
			await fetch("/api/ghl/locations/default", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ locationId: newLocationId }),
			});

			// Refresh the page to load data for the new location
			router.refresh();
		} catch (err) {
			console.error("Error updating default location:", err);
		}
	};

	if (isLoading)
		return (
			<div className='text-gray-500 dark:text-gray-400'>
				Loading locations...
			</div>
		);

	return (
		<div className='flex items-center'>
			<label
				htmlFor='location'
				className='mr-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
				Location:
			</label>
			<select
				id='location'
				value={selectedLocation}
				onChange={handleLocationChange}
				className='rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'>
				{locations.map((location) => (
					<option
						key={location.id || location.locationId || `loc-${location.name}`}
						value={location.id || location.locationId || ""}>
						{location.name}
					</option>
				))}
			</select>
		</div>
	);
}

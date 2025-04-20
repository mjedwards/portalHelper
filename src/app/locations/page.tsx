"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Location } from "../types/ghl";

export default function LocationPage() {
	const [locations, setLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		async function fetchLocations() {
			try {
				const response = await fetch("/api/ghl/locations");
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to fetch locations");
				}

				setLocations(data.locations || []);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchLocations();
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const testLocation = (locationId: any) => {
		router.push(`/test-api?locationId=${locationId}`);
	};

	if (loading) {
		return (
			<div className='p-8'>
				<h1 className='text-2xl font-bold mb-4'>Loading Locations.....</h1>
				<div className='animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent'></div>
			</div>
		);
	}
	if (error) {
		return (
			<div className='p-8'>
				<h1 className='text-2xl font-bold mb-4'>Error</h1>
				<div className='bg-red-100 p-4 rounded'>
					<p className='text-red-800'>{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className='p-8'>
			<h1 className='text-2xl font-bold mb-4'>Your GHL Locations</h1>
			{locations.length === 0 ? (
				<p>No locations found.</p>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{locations.map((location) => (
						<div key={location.id} className='border rounded-lg p-4 shadow-sm'>
							<h2 className='text-lg font-semibold'>{location.name}</h2>
							<p className='text-gray-600 text-sm mb-2'>ID: {location.id}</p>
							<button
								onClick={() => testLocation(location.id)}
								className='mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
								Test API with this location
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

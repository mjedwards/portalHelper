/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestResult() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const success = searchParams.get("success") === "true";
	const error = searchParams.get("error");
	const [apiData, setApiData] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [locations, setLocations] = useState<any[]>([]);
	const [selectedLocationId, setSelectedLocationId] = useState<string>("");
	const [fetchingLocations, setFetchingLocations] = useState<boolean>(false);
	const [locationError, setLocationError] = useState<string | null>(null);

	// Fetch available locations when the component loads
	useEffect(() => {
		if (success) {
			fetchLocations();
		}
	}, [success]);

	async function fetchLocations() {
		setFetchingLocations(true);
		setLocationError(null);
		try {
			const response = await fetch("/api/ghl/locations");
			const data = await response.json();

			if (data.success && data.locations && data.locations.length > 0) {
				setLocations(data.locations);
				// Set the first location as the default selected one
				setSelectedLocationId(data.locations[0].id);
			} else if (data.error) {
				console.error("Error fetching locations:", data.message);
				setLocationError(data.message || "Failed to fetch locations");
			}
		} catch (error: any) {
			console.error("Failed to fetch locations:", error);
			setLocationError(error.message || "Failed to fetch locations");
		} finally {
			setFetchingLocations(false);
		}
	}

	const testApiCall = async () => {
		if (!success) return;

		setLoading(true);
		setApiData(null);

		try {
			// Use the selected location ID if available
			const url = selectedLocationId
				? `/api/ghl/test-api?locationId=${selectedLocationId}`
				: "/api/ghl/test-api";

			const response = await fetch(url);
			const data = await response.json();
			setApiData(data);
		} catch (err: any) {
			console.error("API test failed:", err);
			setApiData({ error: err.message || "API call failed" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-8 max-w-4xl mx-auto'>
			<h1 className='text-2xl font-bold mb-4'>Connection Test Result</h1>

			{success ? (
				<div className='bg-green-100 p-4 rounded mb-4'>
					<p className='text-green-800'>✅ Authentication successful</p>
				</div>
			) : (
				<div className='bg-red-100 p-4 rounded mb-4'>
					<p className='text-red-800'>❌ Authentication failed</p>
					{error && (
						<p className='mt-2 text-black'>
							Error: {decodeURIComponent(error)}
						</p>
					)}
				</div>
			)}

			{success && (
				<div className='mt-4'>
					{fetchingLocations && (
						<div className='mb-4 flex items-center'>
							<div className='animate-spin h-5 w-5 mr-2 border-2 border-blue-500 rounded-full border-t-transparent'></div>
							<p>Fetching available locations...</p>
						</div>
					)}

					{locationError && (
						<div className='mb-4 bg-red-100 p-4 rounded'>
							<p className='text-red-800'>
								Error fetching locations: {locationError}
							</p>
							<p className='mt-2 text-sm'>
								This may be due to missing scopes. Make sure your app has the{" "}
								<code>oauth.readonly</code> scope.
							</p>
							<button
								onClick={fetchLocations}
								className='mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'>
								Retry
							</button>
						</div>
					)}

					{locations.length > 0 && (
						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Select Location for API Test:
							</label>
							<select
								value={selectedLocationId}
								onChange={(e) => setSelectedLocationId(e.target.value)}
								className='w-full p-2 border border-gray-300 rounded'>
								{locations.map((loc) => (
									<option key={loc.id} value={loc.id}>
										{loc.name}
									</option>
								))}
							</select>
						</div>
					)}

					<button
						onClick={testApiCall}
						disabled={loading || locations.length === 0}
						className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300'>
						{loading ? "Testing API..." : "Test API Call"}
					</button>

					{apiData && (
						<div className='mt-4 bg-gray-100 p-4 rounded'>
							<h2 className='text-lg font-semibold mb-2'>API Response</h2>
							<pre className='whitespace-pre-wrap overflow-auto bg-black text-white p-4 rounded max-h-96'>
								{JSON.stringify(apiData, null, 2)}
							</pre>
						</div>
					)}
				</div>
			)}

			<div className='mt-4'>
				<button
					onClick={() => router.push("/test-connection")}
					className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'>
					Back To Test Page
				</button>
			</div>
		</div>
	);
}

"use client";

import { useSearchParams, useRouter } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from "react";

export default function TestResult() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const success = searchParams.get("success") === "true";
	const error = searchParams.get("error");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [apiData, setApiData] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const testApiCall = async () => {
		if (!success) return;

		setLoading(true);

		try {
			const response = await fetch("/api/ghl/test-api");
			const data = await response.json();
			setApiData(data);
		} catch (err) {
			console.error("API test failed:", err);
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
					<button
						onClick={testApiCall}
						disabled={loading}
						className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300'>
						{loading ? "Testing API..." : "Test API Call"}
					</button>

					{apiData && (
						<div className='mt-4 bg-black rounded'>
							<h2 className='text-lg font-semibold mb-2'>API Response</h2>
							<pre className='whitespace-pre-wrap'>
								{JSON.stringify(apiData, null, 2)}
							</pre>
						</div>
					)}
				</div>
			)}

			<div>
				<button
					onClick={() => router.push("/test-connection")}
					className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'>
					Back To Test Page
				</button>
			</div>
		</div>
	);
}

"use client";

import { useState } from "react";

export default function OAuthTest() {
	const [authUrl, setAuthUrl] = useState("");

	const generateAuthUrl = () => {
		const clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID_V2;
		const redirectUri = encodeURIComponent(
			"http://localhost:3000/oauth/callback"
		);
		const scope = encodeURIComponent(
			"businesses.readonly contacts.readonly calendars/events.readonly oauth.readonly locations.readonly"
		);

		const url = `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=${scope}`;

		setAuthUrl(url);
		return url;
	};

	return (
		<div className='p-8'>
			<h1 className='text-2xl font-bold mb-4'>GoHighLevel OAuth Test</h1>

			<div className='mb-4'>
				<button
					onClick={() => window.open(generateAuthUrl(), "_blank")}
					className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
					Test OAuth in New Tab
				</button>
			</div>

			{authUrl && (
				<div className='mt-4'>
					<h2 className='text-lg font-semibold mb-2'>Generated URL:</h2>
					<textarea
						readOnly
						value={authUrl}
						className='w-full h-32 p-2 border border-gray-300 rounded'
					/>
				</div>
			)}
		</div>
	);
}

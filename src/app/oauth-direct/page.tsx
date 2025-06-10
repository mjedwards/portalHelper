"use client";

import { useState, useEffect } from "react";

export default function OAuthDirect() {
	const [clientId, setClientId] = useState("");

	useEffect(() => {
		// Get the client ID from env vars
		setClientId(process.env.NEXT_PUBLIC_GHL_CLIENT_ID_V4 || "");
	}, []);

	// Function to directly redirect
	const directAuth = () => {
		const redirectUri = encodeURIComponent(
			"http://localhost:3000/oauth/callback"
		);
		const scope = encodeURIComponent(
			"businesses.readonly contacts.readonly calendars/events.readonly oauth.readonly locations.readonly"
		);

		// Create the URL explicitly
		const url = `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=${scope}`;

		// Log the URL before redirect
		console.log("Direct auth URL:", url);

		// Use direct window.location assignment
		window.location.assign(url);
	};

	return (
		<div className='p-8'>
			<h1 className='text-2xl font-bold mb-4'>Direct GoHighLevel OAuth Test</h1>

			<div className='mb-4'>
				<p>
					Client ID: {clientId ? clientId.substring(0, 5) + "..." : "Not found"}
				</p>
				<button
					onClick={directAuth}
					className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
					Direct OAuth Test
				</button>
			</div>

			<div className='mt-8'>
				<h2 className='text-lg font-bold mb-2'>Alternative Links</h2>
				<div className='space-y-4'>
					<div>
						<h3 className='font-medium'>Standard Marketplace</h3>
						<a
							href={`https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent(
								"http://localhost:3000/oauth/callback"
							)}&client_id=${clientId}&scope=${encodeURIComponent(
								"businesses.readonly contacts.readonly oauth.readonly"
							)}`}
							target='_blank'
							rel='noopener noreferrer'
							className='text-blue-600 hover:underline'>
							Try LeadConnectorHQ URL
						</a>
					</div>

					<div>
						<h3 className='font-medium'>Alternative Marketplace</h3>
						<a
							href={`https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent(
								"http://localhost:3000/oauth/callback"
							)}&client_id=${clientId}&scope=${encodeURIComponent(
								"businesses.readonly contacts.readonly oauth.readonly"
							)}`}
							target='_blank'
							rel='noopener noreferrer'
							className='text-blue-600 hover:underline'>
							Try GoHighLevel URL
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

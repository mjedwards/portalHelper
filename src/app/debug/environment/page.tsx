// src/app/debug/environment/page.tsx
"use client";

import { useState } from "react";

export default function EnvironmentDebug() {
	const [showVariables, setShowVariables] = useState(false);

	return (
		<div className='p-8 max-w-4xl mx-auto'>
			<h1 className='text-2xl font-bold mb-6'>Environment Variables Debug</h1>

			<button
				onClick={() => setShowVariables(!showVariables)}
				className='px-4 py-2 bg-blue-600 text-white rounded mb-4'>
				{showVariables ? "Hide Variables" : "Show Public Variables"}
			</button>

			{showVariables && (
				<div className='bg-black p-4 rounded'>
					<h2 className='text-lg font-semibold mb-2'>
						Public Environment Variables
					</h2>
					<ul className='space-y-2'>
						<li>
							<strong>NEXT_PUBLIC_GHL_CLIENT_ID_V4:</strong>{" "}
							{process.env.NEXT_PUBLIC_GHL_CLIENT_ID_V4 || "Not set"}
						</li>
						<li>
							<strong>NEXT_PUBLIC_GHL_REDIRECT_URI:</strong>{" "}
							{process.env.NEXT_PUBLIC_GHL_REDIRECT_URI || "Not set"}
						</li>
					</ul>

					<p className='mt-4 text-amber-600'>
						Note: Private variables like GHL_CLIENT_SECRET_V4 cannot be
						displayed in the browser.
					</p>
				</div>
			)}

			<div className='mt-6 bg-black p-4 rounded'>
				<h2 className='text-lg font-semibold mb-2'>Authentication URL Test</h2>
				<p className='mb-4'>
					Click the button below to generate and display the authentication URL
					that will be used for the OAuth flow:
				</p>

				<button
					onClick={() => {
						const clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID_V4;
						const redirectUri = encodeURIComponent(
							process.env.NEXT_PUBLIC_GHL_REDIRECT_URI || ""
						);
						const scope = encodeURIComponent(
							"businesses.readonly contacts.readonly calendars/events.readonly"
						);

						const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=${scope}`;

						// Open it in a new window
						window.open(authUrl, "_blank");
					}}
					className='px-4 py-2 bg-green-600 text-white rounded'>
					Test Auth URL
				</button>
			</div>
		</div>
	);
}

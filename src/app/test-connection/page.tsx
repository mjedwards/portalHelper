/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { getAuthUrl } from "@/utils/api/authUtils.client";

export default function TestConnection() {
	const [status, setStatus] = useState<string>("Not Connected");
	const [tokenData, setTokenData] = useState<any>(null);

	const initiateAuth = () => {
		setStatus("Initiating authentication.....");
		// redirect
		window.location.href = getAuthUrl();
	};

	return (
		<div className='p-8'>
			<h1 className='text-2xl font-bold mb-4'>GHL Connection Test</h1>
			<div className='mb-4'>
				<p>
					Connection Status: <span className='font-semibold'>{status}</span>
				</p>
			</div>
			<button
				onClick={initiateAuth}
				className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
				Test Connection
			</button>
			{tokenData && (
				<div>
					<h2>Token Information</h2>
					<pre>{JSON.stringify(tokenData, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}

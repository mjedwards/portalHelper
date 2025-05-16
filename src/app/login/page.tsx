"use client";

import { useState } from "react";
import { getAuthUrl } from "@/utils/api/authUtils.client";

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = () => {
		setIsLoading(true);
		window.location.href = getAuthUrl();
	};

	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='w-full max-w-md p-8 bg-white shadow-lg rounded-lg'>
				<h1 className='text-2xl font-bold text-center mb-6 text-black'>
					Connect with GoHighLevel
				</h1>
				<p className='text-center text-gray-600 mb-8'>
					To access your dashboard, you need to connect your GoHighLevel
					account.
				</p>
				<button
					onClick={handleLogin}
					disabled={isLoading}
					className='w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-70'>
					{isLoading ? "Connecting..." : "Connect with GoHighLevel"}
				</button>
			</div>
		</div>
	);
}

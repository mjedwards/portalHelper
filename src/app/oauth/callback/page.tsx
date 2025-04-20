"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OAuthCallback() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState<string>("Processing...");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function processCode() {
			const code = searchParams.get("code");

			if (!code) {
				setError("No authorization code received");
				return;
			}

			try {
				setStatus("Exchanging code for token...");

				const response = await fetch("/api/auth/exchange-code", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ code }),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to exchange code for tokens");
				}

				setStatus("Authentication successful");

				setTimeout(() => {
					router.push("/test-connection/result?success=true");
				}, 1500);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (err: any) {
				console.error(err.message || "An unknown error occurred");
				router.push(
					"/test-connection/result?success=false&error=" +
						encodeURIComponent(err.message)
				);
			}
		}
		processCode();
	}, [searchParams, router]);

	return (
		<div className='fle min-h-screen items-center justify-center'>
			<div className='text-center p-8 rounded-lg shadow-md bg-black'>
				<h1 className='text-2xl font-bold mb-4'>OAuth Callback Processing</h1>
				{error ? (
					<div className='text-red-600'>
						<p>Error: {error}</p>
					</div>
				) : (
					<div>
						<p>{status}</p>
						<div className='mt-4'>
							<div className='animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto'></div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

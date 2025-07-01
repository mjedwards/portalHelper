"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// export default function CallbackPage() {
// 	const router = useRouter();
// 	const searchParams = useSearchParams();
// 	const [error, setError] = useState<string | null>(null);
// 	const code = searchParams.get("code");

// 	useEffect(() => {
// 		const exchangeCode = async () => {
// 			if (!code) {
// 				setError("No authorization code received");
// 				return;
// 			}

// 			try {
// 				// Send code to our API endpoint
// 				const response = await fetch("/api/auth/callback", {
// 					method: "POST",
// 					headers: {
// 						"Content-Type": "application/json",
// 					},
// 					body: JSON.stringify({ code }),
// 				});

// 				if (!response.ok) {
// 					const data = await response.json();
// 					setError(data.error || "Failed to exchange code for token");
// 					return;
// 				}

// 				// Redirect to dashboard after successful auth
// 				router.push("/dashboard");
// 			} catch (err) {
// 				console.error("Error during code exchange:", err);
// 				setError("Failed to complete authentication");
// 			}
// 		};

// 		exchangeCode();
// 	}, [code, router]);

// 	if (error) {
// 		return (
// 			<div className='flex min-h-screen items-center justify-center'>
// 				<div className='max-w-md p-8 bg-red-50 rounded-lg border border-red-200'>
// 					<h1 className='text-xl font-semibold text-red-700'>
// 						Authentication Error
// 					</h1>
// 					<p className='mt-2 text-red-600'>{error}</p>
// 					<button
// 						onClick={() => router.push("/login")}
// 						className='mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700'>
// 						Back to Login
// 					</button>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className='flex min-h-screen items-center justify-center'>
// 			<div className='text-center'>
// 				<h1 className='text-xl font-semibold'>Completing Authentication...</h1>
// 				<p className='mt-2 text-gray-600'>
// 					Please wait while we set up your account.
// 				</p>
// 			</div>
// 		</div>
// 	);
// }
function CallbackContent() {
	// Move all your existing component code here
	const router = useRouter();
	const searchParams = useSearchParams();
	const [error, setError] = useState<string | null>(null);
	const code = searchParams.get("code");

	useEffect(() => {
		const exchangeCode = async () => {
			if (!code) {
				setError("No authorization code received");
				return;
			}

			try {
				// Send code to our API endpoint
				const response = await fetch("/api/auth/callback", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ code }),
				});

				if (!response.ok) {
					const data = await response.json();
					setError(data.error || "Failed to exchange code for token");
					return;
				}

				// Redirect to dashboard after successful auth
				router.push("/dashboard");
			} catch (err) {
				console.error("Error during code exchange:", err);
				setError("Failed to complete authentication");
			}
		};

		exchangeCode();
	}, [code, router]);

	if (error) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='max-w-md p-8 bg-red-50 rounded-lg border border-red-200'>
					<h1 className='text-xl font-semibold text-red-700'>
						Authentication Error
					</h1>
					<p className='mt-2 text-red-600'>{error}</p>
					<button
						onClick={() => router.push("/login")}
						className='mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700'>
						Back to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='text-center'>
				<h1 className='text-xl font-semibold'>Completing Authentication...</h1>
				<p className='mt-2 text-gray-600'>
					Please wait while we set up your account.
				</p>
			</div>
		</div>
	);
}

// Loading component for Suspense fallback
function LoadingCallback() {
	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='text-center'>
				<h1 className='text-xl font-semibold'>Loading...</h1>
				<p className='mt-2 text-gray-600'>Setting up authentication...</p>
			</div>
		</div>
	);
}

// Main component wrapped with Suspense
export default function CallbackPage() {
	return (
		<Suspense fallback={<LoadingCallback />}>
			<CallbackContent />
		</Suspense>
	);
}

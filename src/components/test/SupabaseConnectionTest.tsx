/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/test/SupabaseConnectionTest.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function SupabaseConnectionTest() {
	const [connectionStatus, setConnectionStatus] = useState<
		"testing" | "connected" | "error"
	>("testing");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [projectInfo, setProjectInfo] = useState<any>(null);

	const testConnection = async () => {
		try {
			setConnectionStatus("testing");
			setErrorMessage("");

			console.log("testing db connection...");

			const { data, error } = await supabase.auth.getSession();

			if (error) {
				throw new Error(`Issue connecting, Auth error: ${error.message}`);
			}

			console.log("Connection is successful.");

			setConnectionStatus("connected");
			setProjectInfo({
				url: process.env.NEXT_PUBLIC_SUPABASE_URL,
				hasSession: !!data.session,
				sessionUser: data.session?.user?.email || "No user logged in",
				timestamp: new Date().toLocaleTimeString(),
			});
		} catch (error: any) {
			console.error("connection test failed:", error);
			setConnectionStatus("error");
			setErrorMessage(error.message || "unknown error");
		}
	};

	useEffect(() => {
		testConnection();
	}, []);

	return (
		<div className='p-6 max-w-2xl mx-auto bg-black'>
			<h2 className='text-2xl font-bold mb-4'>Supabase Connection Test</h2>

			<div className='space-y-4'>
				{/* Connection Status */}
				<div className='flex items-center space-x-2'>
					<span className='font-medium'>Status:</span>
					<span
						className={`px-3 py-1 rounded-full text-sm font-medium ${
							connectionStatus === "testing"
								? "bg-yellow-100 text-yellow-800"
								: connectionStatus === "connected"
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}>
						{connectionStatus === "testing" && "🔄 Testing..."}
						{connectionStatus === "connected" && "✅ Connected"}
						{connectionStatus === "error" && "❌ Error"}
					</span>
				</div>

				{/* Error Message */}
				{connectionStatus === "error" && (
					<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
						<h3 className='font-medium text-red-800 mb-2'>Connection Error:</h3>
						<p className='text-red-700 text-sm'>{errorMessage}</p>
						<div className='mt-3 text-xs text-red-600'>
							<p>
								<strong>Common fixes:</strong>
							</p>
							<ul className='list-disc list-inside mt-1 space-y-1'>
								<li>Check your environment variables in .env.local</li>
								<li>
									Make sure NEXT_PUBLIC_SUPABASE_URL and
									NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
								</li>
								<li>
									Restart your development server after changing .env.local
								</li>
							</ul>
						</div>
					</div>
				)}

				{/* Success Info */}
				{connectionStatus === "connected" && projectInfo && (
					<div className='bg-green-50 border border-green-200 rounded-lg p-4'>
						<h3 className='font-medium text-green-800 mb-2'>
							✅ Connection Successful!
						</h3>
						<div className='text-sm text-green-700 space-y-1'>
							<p>
								<strong>Project URL:</strong> {projectInfo.url}
							</p>
							<p>
								<strong>Auth Status:</strong>{" "}
								{projectInfo.hasSession ? "Has Session" : "No Session (Normal)"}
							</p>
							<p>
								<strong>User:</strong> {projectInfo.sessionUser}
							</p>
							<p>
								<strong>Test Time:</strong> {projectInfo.timestamp}
							</p>
						</div>
						<div className='mt-3 text-xs text-green-600'>
							<p>
								🎉 Your Supabase client is working correctly! You&apos;re ready
								to set up your database schema.
							</p>
						</div>
					</div>
				)}

				{/* Environment Variables Check */}
				<div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
					<h3 className='font-medium text-gray-800 mb-2'>
						Environment Variables:
					</h3>
					<div className='text-sm text-gray-600 space-y-1'>
						<p>
							<strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
							<span
								className={
									process.env.NEXT_PUBLIC_SUPABASE_URL
										? "text-green-600"
										: "text-red-600"
								}>
								{process.env.NEXT_PUBLIC_SUPABASE_URL
									? " ✅ Set"
									: " ❌ Missing"}
							</span>
						</p>
						<p>
							<strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
							<span
								className={
									process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
										? "text-green-600"
										: "text-red-600"
								}>
								{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
									? " ✅ Set"
									: " ❌ Missing"}
							</span>
						</p>
					</div>
					{process.env.NEXT_PUBLIC_SUPABASE_URL &&
						process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
							<div className='mt-2 text-xs text-gray-500'>
								<p>✅ All required environment variables are present</p>
							</div>
						)}
				</div>

				{/* What This Test Does */}
				<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
					<h3 className='font-medium text-blue-800 mb-2'>
						What This Test Checks:
					</h3>
					<ul className='text-sm text-blue-700 space-y-1 list-disc list-inside'>
						<li>Supabase client can be initialized</li>
						<li>Environment variables are properly set</li>
						<li>Can communicate with Supabase auth service</li>
						<li>Basic connection to your Supabase project</li>
					</ul>
					<p className='text-xs text-blue-600 mt-2'>
						<strong>Note:</strong> This test doesn&apos;t require any database
						tables or schema.
					</p>
				</div>

				{/* Retry Button */}
				<button
					onClick={testConnection}
					className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
					🔄 Retry Connection Test
				</button>
			</div>
		</div>
	);
}

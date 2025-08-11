"use client";

import { useState } from "react";
import { useClaude } from "@/hooks/useClaude";

export default function QuickChat() {
	const [input, setInput] = useState("");

	// Basic hook usage
	const { sendMessage, isLoading, response, error } = useClaude();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		await sendMessage(input);
		setInput(""); // Clear input after sending
	};

	return (
		<div className='p-4 border rounded-lg'>
			<h3 className='text-lg font-semibold mb-4'>Quick Chat with Claude</h3>

			<form onSubmit={handleSubmit} className='space-y-3'>
				<input
					type='text'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder='Ask Claude something...'
					className='w-full p-2 border rounded text-black'
					disabled={isLoading}
				/>

				<button
					type='submit'
					disabled={isLoading || !input.trim()}
					className='w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'>
					{isLoading ? "Thinking..." : "Send"}
				</button>
			</form>

			{error && (
				<div className='mt-3 p-3 bg-red-100 text-red-700 rounded'>{error}</div>
			)}

			{response && (
				<div className='mt-3 p-3 bg-gray-100 rounded'>
					<p className='whitespace-pre-wrap text-black'>{response.content}</p>
				</div>
			)}
		</div>
	);
}

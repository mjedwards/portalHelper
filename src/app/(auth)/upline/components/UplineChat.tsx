"use client";

import { useState, useRef, useEffect } from "react";
import { useUpline } from "@/hooks/useUpline";
import { OBJECTION_SCENARIOS } from "@/utils/uplinePrompts";

const MOCK_AGENT_ID = "agent-123";

export default function UplineChat() {
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const {
		messages,
		isCoaching,
		currentContext,
		activeRoleplay,
		error,
		sendMessage,
		startRoleplay,
		requestCoaching,
		getMotivation,
		reset,
	} = useUpline({
		agentId: MOCK_AGENT_ID,
		onRoleplayComplete: (session) => {
			console.log("Roleplay completed:", session);
		},
		onCoachingInsight: (insight) => {
			console.log("New Insight:", insight);
		},
	});

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isCoaching) return;

		await sendMessage(input);
		setInput("");
		inputRef.current?.focus();
	};

	const quickActions = [
		{
			label: "Start Roleplay",
			action: () => setShowObjections(!showObjections),
		},
		{
			label: "Performance Review",
			action: () =>
				requestCoaching("my current KPIs and what needs improvement"),
		},
		{ label: "Cardone Boost", action: () => getMotivation("cardone") },
		{
			label: "Training Request",
			action: () => requestCoaching("teach me NEPQ structure"),
		},
	];

	const [showObjections, setShowObjections] = useState(false);

	return (
		<div className='flex flex-col h-screen bg-gray-900 text-white'>
			{/* Header */}
			<div className='bg-gradient-to-r from-blue-900 to-purple-900 p-4 border-b border-gray-700'>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-2xl font-bold'>THE UPLINE</h1>
						<p className='text-gray-300 text-sm'>
							Your AI Sales Mentor • Agent:{" "}
							{currentContext?.agent.name || "Loading..."}
						</p>
					</div>
					<div className='flex space-x-2'>
						{currentContext && (
							<div className='text-right text-sm'>
								<div className='text-green-400'>
									Placement: {currentContext.metrics.placementRate}%
								</div>
								<div className='text-yellow-400'>
									Chargebacks: {currentContext.metrics.chargebacks}
								</div>
							</div>
						)}
						<button
							onClick={reset}
							className='px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm'>
							Reset Session
						</button>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className='bg-gray-800 p-3 border-b border-gray-700'>
				<div className='flex flex-wrap gap-2'>
					{quickActions.map((action, index) => (
						<button
							key={index}
							onClick={action.action}
							className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors'>
							{action.label}
						</button>
					))}
				</div>

				{/* Objection Selection */}
				{showObjections && (
					<div className='mt-3 p-3 bg-gray-700 rounded-lg'>
						<h3 className='font-semibold mb-2'>
							Select Objection to Practice:
						</h3>
						<div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
							{Object.entries(OBJECTION_SCENARIOS).map(([key, scenario]) => (
								<button
									key={key}
									onClick={() => {
										startRoleplay(scenario.title);
										setShowObjections(false);
									}}
									className='p-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium'>
									{scenario.title}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-4 space-y-4'>
				{error && (
					<div className='bg-red-900/50 border border-red-500 rounded-lg p-3'>
						<p className='text-red-200'>{error}</p>
					</div>
				)}

				{messages.map((message) => (
					<div
						key={message.id}
						className={`flex ${
							message.role === "user" ? "justify-end" : "justify-start"
						}`}>
						<div
							className={`max-w-3xl p-4 rounded-lg ${
								message.role === "user"
									? "bg-blue-600 text-white"
									: message.type === "roleplay"
									? "bg-red-800/50 border border-red-500"
									: message.type === "motivation"
									? "bg-yellow-800/50 border border-yellow-500"
									: "bg-gray-700"
							}`}>
							<div className='flex items-start space-x-3'>
								<div className='flex-shrink-0'>
									{message.role === "upline" && (
										<div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-sm'>
											UL
										</div>
									)}
								</div>
								<div className='flex-1'>
									<div className='flex items-center space-x-2 mb-1'>
										<span className='font-semibold'>
											{message.role === "upline" ? "THE UPLINE" : "You"}
										</span>
										<span className='text-xs opacity-60'>
											{message.timestamp.toLocaleTimeString()}
										</span>
										{message.type !== "coaching" && (
											<span className='text-xs px-2 py-1 rounded-full bg-black/20 capitalize'>
												{message.type}
											</span>
										)}
									</div>
									<div className='whitespace-pre-wrap'>{message.content}</div>
									{message.metadata?.score && (
										<div className='mt-2 text-sm'>
											<span className='bg-black/20 px-2 py-1 rounded'>
												Score: {message.metadata.score}/10
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				))}

				{isCoaching && (
					<div className='flex justify-start'>
						<div className='bg-gray-700 p-4 rounded-lg'>
							<div className='flex items-center space-x-2'>
								<div className='w-4 h-4 bg-blue-500 rounded-full animate-pulse'></div>
								<span>THE UPLINE is coaching you...</span>
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<form onSubmit={handleSubmit} className='p-4 border-t border-gray-700'>
				<div className='flex space-x-3'>
					<input
						ref={inputRef}
						type='text'
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={
							activeRoleplay
								? `Respond to the objection as you would with a real prospect...`
								: `Ask THE UPLINE anything - coaching, roleplay, motivation...`
						}
						className='flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						disabled={isCoaching}
					/>
					<button
						type='submit'
						disabled={isCoaching || !input.trim()}
						className='px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors'>
						{isCoaching ? "Coaching..." : "Send"}
					</button>
				</div>

				{activeRoleplay && (
					<div className='mt-2 text-sm text-yellow-300'>
						🎭 Active Roleplay: {activeRoleplay} - Respond as if talking to a
						real prospect
					</div>
				)}
			</form>
		</div>
	);
}

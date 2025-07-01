/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { GhlClientService } from "@/utils/api/ghl.client.service";
import {
	ContactDetailsResponse,
	ContactDetailType,
	ContactEvent,
	ContactNote,
	ContactTask,
	isEventsResponse,
	isNotesResponse,
	isTasksResponse,
} from "@/app/types/contact-details";
import {
	processNoteBody,
	isWavvCall,
	extractCallDuration,
	extractPhoneNumbers,
} from "@/utils/noteUtils";

interface ContactDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	contactId: string;
	contactName: string;
	detailType: ContactDetailType;
}

export default function ContactDetailsModal({
	isOpen,
	onClose,
	contactId,
	contactName,
	detailType,
}: ContactDetailsModalProps) {
	const [data, setData] = useState<ContactDetailsResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen && contactId) {
			fetchContactDetails();
		}
	}, [isOpen, contactId, detailType]);

	const fetchContactDetails = async () => {
		setIsLoading(true);
		setError(null);
		setData(null);

		try {
			const response = await GhlClientService.getContactDetails(
				contactId,
				detailType
			);
			setData(response);
			console.log(data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch contact details"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString() + " " + date.toLocaleTimeString();
		} catch {
			return dateString;
		}
	};

	const getDetailTitle = () => {
		switch (detailType) {
			case "tasks":
				return "Tasks";
			case "appointments":
				return "Appointments";
			case "notes":
				return "Notes";
			default:
				return "Details";
		}
	};

	const getDetailIcon = () => {
		switch (detailType) {
			case "tasks":
				return (
					<svg
						className='w-5 h-5'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
						/>
					</svg>
				);
			case "appointments":
				return (
					<svg
						className='w-5 h-5'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
						/>
					</svg>
				);
			case "notes":
				return (
					<svg
						className='w-5 h-5'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8M9 7V6a1 1 0 011-1h4a1 1 0 011 1v1'
						/>
					</svg>
				);
		}
	};

	const renderTasksContent = (tasks: ContactTask[]) => (
		<div className='space-y-3'>
			{tasks.map((task) => (
				<div
					key={task.id}
					className={`p-4 rounded-lg border ${
						task.completed
							? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
							: "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
					}`}>
					<div className='flex items-start justify-between'>
						<div className='flex-1'>
							<h4
								className={`font-medium ${
									task.completed
										? "line-through text-green-700 dark:text-green-400"
										: "text-gray-900 dark:text-white"
								}`}>
								{task.title}
							</h4>
							{task.body && (
								<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
									{task.body}
								</p>
							)}
							{task.dueDate && (
								<p className='text-xs text-gray-500 dark:text-gray-500 mt-2'>
									Due: {formatDate(task.dueDate)}
								</p>
							)}
						</div>
						<span
							className={`px-2 py-1 text-xs font-medium rounded-full ${
								task.completed
									? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
									: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
							}`}>
							{task.completed ? "Completed" : "Pending"}
						</span>
					</div>
				</div>
			))}
		</div>
	);

	const renderAppointmentsContent = (events: ContactEvent[]) => (
		<div className='space-y-3'>
			{events.map((event) => (
				<div
					key={event.id}
					className='p-4 rounded-lg border bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'>
					<div className='flex items-start justify-between'>
						<div className='flex-1'>
							<h4 className='font-medium text-gray-900 dark:text-white'>
								{event.title}
							</h4>
							<div className='text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1'>
								<p>
									📅 {formatDate(event.startTime)} - {formatDate(event.endTime)}
								</p>
								{event.address && <p>📍 {event.address}</p>}
								{event.notes && <p>📝 {event.notes}</p>}
							</div>
						</div>
						<span
							className={`px-2 py-1 text-xs font-medium rounded-full ${
								event.status === "confirmed" ||
								event.appointmentStatus === "confirmed"
									? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
									: event.status === "cancelled"
									? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
									: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
							}`}>
							{event.appointmentStatus || event.status}
						</span>
					</div>
				</div>
			))}
		</div>
	);

	const renderNotesContent = (notes: ContactNote[]) => (
		<div className='space-y-3'>
			{notes.map((note) => {
				const processedBody = processNoteBody(note.body);
				const isWavv = isWavvCall(note.body);
				const duration = isWavv ? extractCallDuration(note.body) : null;
				const phoneNumbers = isWavv ? extractPhoneNumbers(note.body) : null;

				return (
					<div
						key={note.id}
						className={`p-4 rounded-lg border ${
							isWavv
								? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
								: "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
						}`}>
						<div className='flex items-start justify-between'>
							<div className='flex-1'>
								{/* Show WAVV Call badge if it's a WAVV call */}
								{isWavv && (
									<div className='flex items-center gap-2 mb-2'>
										<span className='inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200'>
											<svg
												className='w-3 h-3 mr-1'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
												/>
											</svg>
											WAVV Call
										</span>
										{duration && (
											<span className='text-xs text-blue-600 dark:text-blue-400'>
												{duration}
											</span>
										)}
									</div>
								)}

								{/* Show phone numbers for WAVV calls */}
								{isWavv && phoneNumbers && (
									<div className='text-sm text-gray-600 dark:text-gray-400 mb-2 space-y-1'>
										{phoneNumbers.to && (
											<p className='flex items-center'>
												<span className='font-medium mr-2'>To:</span>
												<a
													href={`tel:${phoneNumbers.to}`}
													className='text-blue-600 dark:text-blue-400 hover:underline'>
													{phoneNumbers.to}
												</a>
											</p>
										)}
										{phoneNumbers.from && (
											<p className='flex items-center'>
												<span className='font-medium mr-2'>From:</span>
												<a
													href={`tel:${phoneNumbers.from}`}
													className='text-blue-600 dark:text-blue-400 hover:underline'>
													{phoneNumbers.from}
												</a>
											</p>
										)}
									</div>
								)}

								{/* Note content */}
								<div className='text-gray-900 dark:text-white whitespace-pre-wrap'>
									{processedBody}
								</div>
							</div>

							{/* Note type indicator */}
							<div className='flex items-center'>
								{isWavv ? (
									<svg
										className='w-4 h-4 text-blue-500'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
										/>
									</svg>
								) : (
									<svg
										className='w-4 h-4 text-gray-400'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8M9 7V6a1 1 0 011-1h4a1 1 0 011 1v1'
										/>
									</svg>
								)}
							</div>
						</div>

						{/* Date added */}
						<p className='text-xs text-gray-500 dark:text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600'>
							Added: {formatDate(note.dateAdded)}
						</p>
					</div>
				);
			})}
		</div>
	);

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className='flex items-center justify-center py-8'>
					<div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
					<span className='ml-2 text-gray-600 dark:text-gray-400'>
						Loading...
					</span>
				</div>
			);
		}

		if (error) {
			return (
				<div className='text-center py-8'>
					<div className='text-red-600 dark:text-red-400'>Error: {error}</div>
					<button
						onClick={fetchContactDetails}
						className='mt-2 text-blue-600 dark:text-blue-400 hover:underline'>
						Try again
					</button>
				</div>
			);
		}

		if (!data) {
			return (
				<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
					No data available
				</div>
			);
		}

		if (isTasksResponse(data)) {
			return data.tasks.length > 0 ? (
				renderTasksContent(data.tasks)
			) : (
				<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
					No tasks found for this contact
				</div>
			);
		}

		if (isEventsResponse(data)) {
			return data.events.length > 0 ? (
				renderAppointmentsContent(data.events)
			) : (
				<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
					No appointments found for this contact
				</div>
			);
		}

		if (isNotesResponse(data)) {
			return data.notes.length > 0 ? (
				renderNotesContent(data.notes)
			) : (
				<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
					No notes found for this contact
				</div>
			);
		}

		return (
			<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
				Unknown data type
			</div>
		);
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 overflow-y-auto'>
			<div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
				{/* Background overlay */}
				<div
					className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75'
					onClick={onClose}
				/>

				{/* Modal panel */}
				<div className='inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg'>
					{/* Header */}
					<div className='flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700'>
						<div className='flex items-center space-x-3'>
							<div className='text-blue-600 dark:text-blue-400'>
								{getDetailIcon()}
							</div>
							<div>
								<h3 className='text-lg font-medium text-gray-900 dark:text-white'>
									{getDetailTitle()} for {contactName}
								</h3>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Contact ID: {contactId}
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>
					</div>

					{/* Content */}
					<div className='mt-4 max-h-96 overflow-y-auto'>{renderContent()}</div>

					{/* Footer */}
					<div className='flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4'>
						<button
							onClick={onClose}
							className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors'>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

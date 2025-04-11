import React, { useState, useEffect } from "react";
import moment from "moment";

interface AppointmentEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	type: "appointment" | "meeting" | "follow-up" | "presentation";
	clientName?: string;
	notes?: string;
	isRecurring?: boolean;
	recurringPattern?: {
		frequency: "daily" | "weekly" | "biweekly" | "monthly";
		endDate?: Date;
	};
}

interface AppointmentEventFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (appointment: AppointmentEvent) => void;
	onDelete: (id: string) => void;
	event: AppointmentEvent | null;
	timeSlot: { start: Date; end: Date } | null;
	mode: "create" | "edit";
}

const AppointmentEventForm: React.FC<AppointmentEventFormProps> = ({
	isOpen,
	onClose,
	onSave,
	onDelete,
	event,
	timeSlot,
	mode,
}) => {
	const [formData, setFormData] = useState<AppointmentEvent>({
		id: "",
		title: "",
		start: new Date(),
		end: new Date(),
		type: "appointment",
		clientName: "",
		notes: "",
		isRecurring: false,
	});

	// Initialize form when event or timeSlot changes
	useEffect(() => {
		if (mode === "edit" && event) {
			setFormData({
				...event,
				// Create copies of dates to avoid modifying the original event
				start: new Date(event.start),
				end: new Date(event.end),
			});
		} else if (mode === "create" && timeSlot) {
			setFormData({
				id: `appt-${Date.now()}`,
				title: "New Appointment",
				start: timeSlot.start,
				end: timeSlot.end,
				type: "appointment",
				clientName: "",
				notes: "",
			});
		}
	}, [event, timeSlot, mode]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "startDate") {
			const newStart = moment(formData.start)
				.set({
					year: new Date(value).getFullYear(),
					month: new Date(value).getMonth(),
					date: new Date(value).getDate(),
				})
				.toDate();

			setFormData((prev) => ({ ...prev, start: newStart }));
		} else if (name === "endDate") {
			const newEnd = moment(formData.end)
				.set({
					year: new Date(value).getFullYear(),
					month: new Date(value).getMonth(),
					date: new Date(value).getDate(),
				})
				.toDate();

			setFormData((prev) => ({ ...prev, end: newEnd }));
		}
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const [hours, minutes] = value.split(":").map(Number);

		if (name === "startTime") {
			const newStart = moment(formData.start).set({ hours, minutes }).toDate();

			setFormData((prev) => ({ ...prev, start: newStart }));
		} else if (name === "endTime") {
			const newEnd = moment(formData.end).set({ hours, minutes }).toDate();

			setFormData((prev) => ({ ...prev, end: newEnd }));
		}
	};

	const handleRecurringToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		const isRecurring = e.target.checked;
		setFormData((prev) => ({
			...prev,
			isRecurring,
			recurringPattern: isRecurring ? { frequency: "weekly" } : undefined,
		}));
	};

	const handleRecurringPatternChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setFormData((prev) => ({
			...prev,
			recurringPattern: {
				...prev.recurringPattern!,
				frequency: e.target.value as
					| "daily"
					| "weekly"
					| "biweekly"
					| "monthly",
			},
		}));
	};

	const handleRecurringEndDateChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const endDate = e.target.value ? new Date(e.target.value) : undefined;
		setFormData((prev) => ({
			...prev,
			recurringPattern: {
				...prev.recurringPattern!,
				endDate,
			},
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(formData);
	};

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this appointment?")) {
			onDelete(formData.id);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
				<div className='p-4 border-b flex justify-between items-center'>
					<h2 className='text-xl font-semibold text-black'>
						{mode === "create" ? "Add Appointment" : "Edit Appointment"}
					</h2>
					<button
						onClick={onClose}
						className='text-gray-500 hover:text-gray-700'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<path d='M18 6L6 18M6 6l12 12' />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className='p-4 space-y-4'>
					<div>
						<label className='block text-gray-700 mb-1'>Title</label>
						<input
							type='text'
							name='title'
							value={formData.title}
							onChange={handleChange}
							className='w-full p-2 border rounded-md'
							required
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-gray-700 mb-1'>Date</label>
							<input
								type='date'
								name='startDate'
								value={moment(formData.start).format("YYYY-MM-DD")}
								onChange={handleDateChange}
								className='w-full p-2 border rounded-md'
								required
							/>
						</div>

						<div>
							<label className='block text-gray-700 mb-1'>Type</label>
							<select
								name='type'
								value={formData.type}
								onChange={handleChange}
								className='w-full p-2 border rounded-md'>
								<option value='appointment'>Appointment</option>
								<option value='meeting'>Meeting</option>
								<option value='follow-up'>Follow-up</option>
								<option value='presentation'>Presentation</option>
							</select>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-gray-700 mb-1'>Start Time</label>
							<input
								type='time'
								name='startTime'
								value={moment(formData.start).format("HH:mm")}
								onChange={handleTimeChange}
								className='w-full p-2 border rounded-md'
								required
							/>
						</div>

						<div>
							<label className='block text-gray-700 mb-1'>End Time</label>
							<input
								type='time'
								name='endTime'
								value={moment(formData.end).format("HH:mm")}
								onChange={handleTimeChange}
								className='w-full p-2 border rounded-md'
								required
							/>
						</div>
					</div>

					<div>
						<label className='block text-gray-700 mb-1'>Client Name</label>
						<input
							type='text'
							name='clientName'
							value={formData.clientName || ""}
							onChange={handleChange}
							className='w-full p-2 border rounded-md'
						/>
					</div>

					<div>
						<label className='block text-gray-700 mb-1'>Notes</label>
						<textarea
							name='notes'
							value={formData.notes || ""}
							onChange={handleChange}
							className='w-full p-2 border rounded-md'
							rows={3}
						/>
					</div>

					<div className='flex items-center'>
						<input
							type='checkbox'
							id='isRecurring'
							checked={formData.isRecurring || false}
							onChange={handleRecurringToggle}
							className='mr-2'
						/>
						<label htmlFor='isRecurring' className='text-gray-700'>
							Recurring Appointment
						</label>
					</div>

					{formData.isRecurring && (
						<div className='grid grid-cols-2 gap-4 pl-6 border-l-2 border-blue-100'>
							<div>
								<label className='block text-gray-700 mb-1'>Frequency</label>
								<select
									name='recurringFrequency'
									value={formData.recurringPattern?.frequency}
									onChange={handleRecurringPatternChange}
									className='w-full p-2 border rounded-md'>
									<option value='daily'>Daily</option>
									<option value='weekly'>Weekly</option>
									<option value='biweekly'>Bi-weekly</option>
									<option value='monthly'>Monthly</option>
								</select>
							</div>

							<div>
								<label className='block text-gray-700 mb-1'>
									End Date (Optional)
								</label>
								<input
									type='date'
									name='recurringEndDate'
									value={
										formData.recurringPattern?.endDate
											? moment(formData.recurringPattern.endDate).format(
													"YYYY-MM-DD"
											  )
											: ""
									}
									onChange={handleRecurringEndDateChange}
									className='w-full p-2 border rounded-md'
								/>
							</div>
						</div>
					)}

					<div className='flex justify-between border-t pt-4'>
						{mode === "edit" && (
							<button
								type='button'
								onClick={handleDelete}
								className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'>
								Delete
							</button>
						)}

						<div className='flex space-x-2 ml-auto'>
							<button
								type='button'
								onClick={onClose}
								className='px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-100'>
								Cancel
							</button>

							<button
								type='submit'
								className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'>
								{mode === "create" ? "Create" : "Update"}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AppointmentEventForm;

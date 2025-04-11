import React from "react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";

interface AddToCalendarNotificationProps {
	onAddToCalendar: () => void;
}

const AddToCalendarNotification: React.FC<AddToCalendarNotificationProps> = ({
	onAddToCalendar,
}) => {
	const { showAddToCalendarNotification, setShowAddToCalendarNotification } =
		useActivityTracker();

	if (!showAddToCalendarNotification) return null;

	return (
		<div className='fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md border-l-4 border-blue-500 z-50 animate-slide-up'>
			<div className='flex items-start'>
				<div className='flex-shrink-0 pt-0.5'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='text-blue-500'>
						<rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
						<line x1='16' y1='2' x2='16' y2='6' />
						<line x1='8' y1='2' x2='8' y2='6' />
						<line x1='3' y1='10' x2='21' y2='10' />
					</svg>
				</div>
				<div className='ml-3 w-0 flex-1'>
					<p className='text-sm font-medium text-gray-900'>
						Appointment Booked
					</p>
					<p className='mt-1 text-sm text-gray-500'>
						Would you like to add details to the calendar?
					</p>
					<div className='mt-4 flex space-x-3'>
						<button
							onClick={onAddToCalendar}
							className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
							Add to Calendar
						</button>
						<button
							onClick={() => setShowAddToCalendarNotification(false)}
							className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
							Dismiss
						</button>
					</div>
				</div>
				<div className='ml-4 flex-shrink-0 flex'>
					<button
						onClick={() => setShowAddToCalendarNotification(false)}
						className='bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500'>
						<span className='sr-only'>Close</span>
						<svg
							className='h-5 w-5'
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 20 20'
							fill='currentColor'
							aria-hidden='true'>
							<path
								fillRule='evenodd'
								d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
								clipRule='evenodd'
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddToCalendarNotification;

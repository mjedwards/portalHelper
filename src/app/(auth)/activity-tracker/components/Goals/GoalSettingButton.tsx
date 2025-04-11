import React, { useState } from "react";
import GoalSettingModal from "./GoalSettingModal";

const GoalSettingButton: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsModalOpen(true)}
				className='flex items-center px-3 py-2 bg-white border rounded-md shadow-sm text-gray-700 hover:bg-gray-50'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='18'
					height='18'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					className='mr-2'>
					<path d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' />
					<line x1='7' y1='7' x2='7.01' y2='7' />
				</svg>
				Set Goals
			</button>

			<GoalSettingModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
};

export default GoalSettingButton;

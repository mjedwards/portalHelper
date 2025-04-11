import React, { useState } from "react";
import WidgetSelector from "./WidgetSelector";

interface AddWidgetButtonProps {
	categoryId: string;
}

const AddWidgetButton: React.FC<AddWidgetButtonProps> = ({ categoryId }) => {
	const [selectorOpen, setSelectorOpen] = useState(false);

	return (
		<div className='relative'>
			<button
				onClick={() => setSelectorOpen(true)}
				className='w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors'>
				<div className='flex items-center justify-center'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='mr-2'>
						<path d='M12 5v14M5 12h14' />
					</svg>
					Add Widget
				</div>
			</button>
			{selectorOpen && (
				<WidgetSelector
					categoryId={categoryId}
					onClose={() => setSelectorOpen(false)}
				/>
			)}
		</div>
	);
};
export default AddWidgetButton;

"use client";

import React from "react";

const IconPlaceholder: React.FC = () => {
	return (
		<svg
			className='w-3.5 h-3.5'
			aria-hidden='true'
			xmlns='http://www.w3.org/2000/svg'
			fill='none'
			viewBox='0 0 18 18'>
			<path
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M9 1v16M1 9h16'
			/>
		</svg>
	);
};

export default IconPlaceholder;

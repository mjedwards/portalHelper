// src/components/layout/SideNav/components/SidebarLink.tsx
"use client";

import React from "react";

interface SidebarLinkProps {
	href: string;
	icon: React.ReactNode;
	label: string;
	badge?: {
		text: string;
		color: string;
	};
	closeSidebar?: () => void; // Optional function to close sidebar
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
	href,
	icon,
	label,
	badge,
	closeSidebar,
}) => {
	const handleClick = () => {
		// If on mobile (window width < 640px) and closeSidebar function exists, call it
		if (
			typeof window !== "undefined" &&
			window.innerWidth < 640 &&
			closeSidebar
		) {
			closeSidebar();
		}
	};

	return (
		<li>
			<a
				href={href}
				onClick={handleClick}
				className='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group'>
				<span className='shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'>
					{icon}
				</span>
				<span className='flex-1 ms-3 whitespace-nowrap'>{label}</span>
				{badge && (
					<span
						className={`inline-flex items-center justify-center px-2 ms-3 text-sm font-medium rounded-full ${badge.color}`}>
						{badge.text}
					</span>
				)}
			</a>
		</li>
	);
};

export default SidebarLink;

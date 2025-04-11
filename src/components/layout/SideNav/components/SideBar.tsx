// src/components/layout/SideNav/components/Sidebar.tsx
"use client";

import React from "react";
import SidebarLink from "./SidebarLink";
import sidebarItems from "../data/sidebarItems";

interface SidebarProps {
	isOpen: boolean;
	toggleSidebar?: () => void; // Add this to allow closing
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
	// Function to close the sidebar (only on mobile)
	const closeSidebar = () => {
		if (
			toggleSidebar &&
			typeof window !== "undefined" &&
			window.innerWidth < 640
		) {
			toggleSidebar();
		}
	};

	return (
		<aside
			id='logo-sidebar'
			className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			} bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700`}
			aria-label='Sidebar'>
			<div className='h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800'>
				<ul className='space-y-2 font-medium'>
					{sidebarItems.map((item, index) => (
						<SidebarLink
							key={index}
							href={item.href}
							icon={item.icon}
							label={item.label}
							badge={item.badge}
							closeSidebar={closeSidebar}
						/>
					))}
				</ul>
			</div>
		</aside>
	);
};

export default Sidebar;

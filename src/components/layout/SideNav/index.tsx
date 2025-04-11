// src/components/layout/SideNav/index.tsx
"use client";

import React, { useState } from "react";
import NavHeader from "./components/NavHeader";
import Sidebar from "./components/SideBar";

const SideNav: React.FC = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<>
			<NavHeader toggleSidebar={toggleSidebar} />
			<Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
		</>
	);
};

export default SideNav;

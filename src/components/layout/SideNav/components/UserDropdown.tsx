// src/components/layout/SideNav/components/UserDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import userDropdownItems from "../data/userDropdownItems";

// Profile data could also be moved to its own file if needed
const userProfile = {
	name: "Neil Sims",
	email: "neil.sims@flowbite.com",
	image: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
};

const UserDropdown: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className='flex items-center ms-3 relative' ref={dropdownRef}>
			<div>
				<button
					type='button'
					onClick={toggleDropdown}
					className='flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600'
					aria-expanded={isOpen ? "true" : "false"}>
					<span className='sr-only'>Open user menu</span>
					<div className='relative w-8 h-8 overflow-hidden rounded-full'>
						<Image
							src={userProfile.image}
							alt='user photo'
							fill
							sizes='32px'
							className='object-cover'
							priority
						/>
					</div>
				</button>
			</div>
			{/* Dropdown menu */}
			<div
				className={`z-50 ${
					isOpen ? "block" : "hidden"
				} absolute right-0 top-full mt-2 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600 min-w-44`}
				id='dropdown-user'>
				<div className='px-4 py-3' role='none'>
					<p className='text-sm text-gray-900 dark:text-white' role='none'>
						{userProfile.name}
					</p>
					<p
						className='text-sm font-medium text-gray-900 truncate dark:text-gray-300'
						role='none'>
						{userProfile.email}
					</p>
				</div>
				<ul className='py-1' role='none'>
					{userDropdownItems.map((item, index) => (
						<li key={index}>
							<Link
								href={item.href}
								className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
								role='menuitem'
								onClick={() => {
									setIsOpen(false);
									if (item.onClick) item.onClick();
								}}>
								{item.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default UserDropdown;

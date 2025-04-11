// src/app/(auth)/dashboard/components/DashboardContent.tsx
import React from "react";

const DashboardContent: React.FC = () => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
			<div className='bg-white p-6 rounded-lg shadow dark:bg-gray-800'>
				<h2 className='text-xl font-semibold mb-4'>Carriers List</h2>
				<div className='border-t pt-4 dark:border-gray-700'>
					{/* Carriers list content goes here */}
					<p className='text-gray-500 dark:text-gray-400'>
						Manage your insurance carriers
					</p>
				</div>
			</div>

			<div className='bg-white p-6 rounded-lg shadow dark:bg-gray-800'>
				<h2 className='text-xl font-semibold mb-4'>Cases & Updates</h2>
				<div className='border-t pt-4 dark:border-gray-700'>
					{/* Cases content goes here */}
					<p className='text-gray-500 dark:text-gray-400'>
						Track your open and recently updated cases
					</p>
				</div>
			</div>

			<div className='bg-white p-6 rounded-lg shadow dark:bg-gray-800'>
				<h2 className='text-xl font-semibold mb-4'>MFA Manager</h2>
				<div className='border-t pt-4 dark:border-gray-700'>
					{/* MFA content goes here */}
					<p className='text-gray-500 dark:text-gray-400'>
						Manage multi-factor authentication settings
					</p>
				</div>
			</div>

			<div className='bg-white p-6 rounded-lg shadow dark:bg-gray-800'>
				<h2 className='text-xl font-semibold mb-4'>Notifications</h2>
				<div className='border-t pt-4 dark:border-gray-700'>
					{/* Notifications content goes here */}
					<p className='text-gray-500 dark:text-gray-400'>
						View your recent notifications and alerts
					</p>
				</div>
			</div>
		</div>
	);
};

export default DashboardContent;

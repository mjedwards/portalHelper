/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// src/app/(auth)/dashboard/components/DashboardContent.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import GhlService from "@/utils/api/ghlService";
import OpportunitiesCard from "./dashboard/OpportunitiesCard";
import {
	DashboardContentProps,
	PaginationParams,
} from "../components/dashboard/types/dashboard";
import { GhlClientService } from "@/utils/api/ghl.client.service";

export default function DashboardContent({
	companyData,
	opportunitiesData: initialOpportunitiesData,
	calendarsData,
	locationId,
	hasLocationError = false,
}: DashboardContentProps) {
	const [opportunitiesData, setOpportunitiesData] = useState(
		initialOpportunitiesData
	);
	const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);

	// Handle pagination for opportunities
	// Handle pagination for opportunities
	const handleOpportunitiesPageChange = async (
		page: number,
		direction: "next" | "prev",
		params?: PaginationParams
	) => {
		if (!locationId || hasLocationError) {
			console.warn(
				"Cannot fetch opportunities: missing locationId or has location error"
			);
			return;
		}

		console.log(`🔄 Dashboard - Handling page change:`, {
			page,
			direction,
			params,
		});

		setIsLoadingOpportunities(true);
		try {
			const filters: any = { limit: 20 };

			// Handle pagination based on direction
			if (direction === "next" && params) {
				if (params.startAfter) filters.startAfter = params.startAfter;
				if (params.startAfterId) filters.startAfterId = params.startAfterId;
			}
			// For "prev" direction, you might need different logic depending on your API
			// Most cursor-based pagination doesn't support going backwards easily

			console.log(`🔄 Dashboard - Fetching with filters:`, filters);

			// 👈 Use the client service instead
			const response = await GhlClientService.getOpportunities(
				locationId,
				filters
			);

			console.log(`✅ Dashboard - Successfully updated opportunities data`);
			setOpportunitiesData(response);
		} catch (error) {
			console.error(
				"❌ Dashboard - Failed to fetch opportunities page:",
				error
			);
			// You might want to show a toast notification here
		} finally {
			setIsLoadingOpportunities(false);
		}
	};
	// const handleOpportunitiesPageChange = ()=> {}
	return (
		<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
			{/* Opportunities Card */}
			<OpportunitiesCard
				opportunitiesData={opportunitiesData}
				onPageChange={handleOpportunitiesPageChange}
				isLoading={isLoadingOpportunities}
				hasError={hasLocationError}
			/>

			{/* Company/Carrier Info Card */}
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold dark:text-white'>
						Company Information
					</h2>
					{companyData?.logoUrl && (
						<div className='h-12 w-12 overflow-hidden rounded'>
							<img
								src={companyData.logoUrl}
								alt={`${companyData.name} logo`}
								className='h-full w-full object-contain bg-white p-1 dark:bg-gray-700'
							/>
						</div>
					)}
				</div>
				<div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
					{companyData?.name ? (
						<>
							<p className='text-gray-700 dark:text-gray-300 mb-2'>
								<span className='font-medium'>Name:</span> {companyData.name}
							</p>
							{companyData?.email && (
								<p className='text-gray-700 dark:text-gray-300 mb-2'>
									<span className='font-medium'>Email:</span>{" "}
									<a
										href={`mailto:${companyData.email}`}
										className='text-blue-600 dark:text-blue-400 hover:underline'>
										{companyData.email}
									</a>
								</p>
							)}
							{companyData?.phone && (
								<p className='text-gray-700 dark:text-gray-300 mb-2'>
									<span className='font-medium'>Phone:</span>{" "}
									<a
										href={`tel:${companyData.phone}`}
										className='text-blue-600 dark:text-blue-400 hover:underline'>
										{companyData.phone}
									</a>
								</p>
							)}
							{companyData?.website && (
								<p className='text-gray-700 dark:text-gray-300 mb-2'>
									<span className='font-medium'>Website:</span>{" "}
									<a
										href={companyData.website}
										target='_blank'
										rel='noopener noreferrer'
										className='text-blue-600 dark:text-blue-400 hover:underline'>
										{companyData.website}
									</a>
								</p>
							)}
						</>
					) : (
						<div className='text-center py-4'>
							<svg
								className='w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-2'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
								/>
							</svg>
							<p className='text-gray-500 dark:text-gray-400 text-sm'>
								Company information not available
							</p>
						</div>
					)}
					<div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
						<Link
							href='/carriers'
							className='inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline'>
							<svg
								className='w-4 h-4 mr-1'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
								/>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
								/>
							</svg>
							Manage Carriers
						</Link>
					</div>
				</div>
			</div>

			{/* Calendar Info Card */}
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold dark:text-white'>
						Calendar Information
					</h2>
					<svg
						className='w-6 h-6 text-gray-400 dark:text-gray-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
						/>
					</svg>
				</div>
				<div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
					{calendarsData?.calendars?.length > 0 ? (
						<>
							<p className='text-gray-700 dark:text-gray-300 mb-4'>
								<span className='font-medium'>Total Calendars:</span>{" "}
								{calendarsData.calendars.length}
							</p>
							<div className='space-y-3 max-h-60 overflow-y-auto'>
								{calendarsData.calendars.slice(0, 5).map((calendar: any) => (
									<div
										key={calendar.id}
										className='border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r'>
										<h3 className='font-medium text-gray-900 dark:text-white'>
											{calendar.name}
										</h3>
										{calendar.description && (
											<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
												{calendar.description}
											</p>
										)}
										<div className='flex items-center justify-between mt-2'>
											<span
												className={`inline-block px-2 py-1 text-xs rounded-full ${
													calendar.isActive
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
												}`}>
												{calendar.isActive ? "Active" : "Inactive"}
											</span>
											{calendar.calendarType && (
												<span className='text-xs text-gray-500 dark:text-gray-400'>
													{calendar.calendarType}
												</span>
											)}
										</div>
									</div>
								))}
								{calendarsData.calendars.length > 5 && (
									<p className='text-sm text-gray-500 dark:text-gray-400 text-center py-2'>
										And {calendarsData.calendars.length - 5} more calendars...
									</p>
								)}
							</div>
						</>
					) : (
						<div className='text-center py-4'>
							<svg
								className='w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-2'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
								/>
							</svg>
							<p className='text-gray-500 dark:text-gray-400 text-sm'>
								No calendars found for this location
							</p>
						</div>
					)}
					<div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
						<Link
							href='/calendars'
							className='inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline'>
							<svg
								className='w-4 h-4 mr-1'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'
								/>
							</svg>
							Manage Calendars
						</Link>
					</div>
				</div>
			</div>

			{/* Quick Stats Card */}
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold dark:text-white'>Quick Stats</h2>
					<svg
						className='w-6 h-6 text-gray-400 dark:text-gray-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4'
						/>
					</svg>
				</div>
				<div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
					<div className='grid grid-cols-1 gap-4'>
						{/* Total Opportunities */}
						<div className='bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
										{opportunitiesData?.meta?.total?.toLocaleString() || "0"}
									</div>
									<div className='text-sm text-blue-600 dark:text-blue-400 font-medium'>
										Total Opportunities
									</div>
								</div>
								<svg
									className='w-8 h-8 text-blue-500 dark:text-blue-400'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
									/>
								</svg>
							</div>
						</div>

						{/* Open Opportunities */}
						<div className='bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-green-600 dark:text-green-400'>
										{opportunitiesData?.opportunities?.filter(
											(opp: any) => opp.status === "open"
										).length || "0"}
									</div>
									<div className='text-sm text-green-600 dark:text-green-400 font-medium'>
										Open Opportunities
									</div>
								</div>
								<svg
									className='w-8 h-8 text-green-500 dark:text-green-400'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
									/>
								</svg>
							</div>
						</div>

						{/* Active Calendars */}
						<div className='bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
										{calendarsData?.calendars?.filter(
											(cal: any) => cal.isActive
										).length || "0"}
									</div>
									<div className='text-sm text-purple-600 dark:text-purple-400 font-medium'>
										Active Calendars
									</div>
								</div>
								<svg
									className='w-8 h-8 text-purple-500 dark:text-purple-400'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
									/>
								</svg>
							</div>
						</div>

						{/* Won Opportunities */}
						<div className='bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
										{opportunitiesData?.opportunities?.filter(
											(opp: any) => opp.status === "won"
										).length || "0"}
									</div>
									<div className='text-sm text-yellow-600 dark:text-yellow-400 font-medium'>
										Won Opportunities
									</div>
								</div>
								<svg
									className='w-8 h-8 text-yellow-500 dark:text-yellow-400'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

"use client";

import { useEffect, useState } from "react";
import { OpportunitiesCardProps } from "./types/dashboard";

export default function OpportunitiesCard({
	opportunitiesData,
	onPageChange,
	isLoading = false,
	hasError = false,
}: OpportunitiesCardProps) {
	const [currentPage, setCurrentPage] = useState(
		opportunitiesData?.meta?.currentPage || 1
	);

	// useEffect(() => {
	// 	// Reset to page 1 if we get fresh data without pagination context
	// 	console.log(!opportunitiesData.meta?.currentPage);
	// 	if (opportunitiesData && !opportunitiesData.meta?.currentPage) {
	// 		setCurrentPage(1);
	// 	} else if (opportunitiesData?.meta?.currentPage) {
	// 		setCurrentPage(opportunitiesData.meta.currentPage);
	// 	}
	// }, [opportunitiesData]);
	console.log(!opportunitiesData.meta.prevPage, "previous");
	const handlePreviousPage = () => {
		if (currentPage > 1 && onPageChange && !isLoading) {
			const newPage = currentPage - 1;
			setCurrentPage(newPage);
			onPageChange(newPage, "prev");
		}
	};

	const handleNextPage = () => {
		console.log(currentPage);
		if (opportunitiesData?.meta?.nextPage && onPageChange) {
			const newPage = currentPage + 1;
			setCurrentPage(newPage);
			onPageChange(newPage, "next", {
				startAfter: opportunitiesData.meta.startAfter,
				startAfterId: opportunitiesData.meta.startAfterId,
			});
		}
	};

	const formatPhoneNumber = (phone: string) => {
		if (!phone) return "";
		const cleaned = phone.replace(/\D/g, "");
		if (cleaned.length === 11 && cleaned.startsWith("1")) {
			const number = cleaned.substring(1);
			return `(${number.substring(0, 3)}) ${number.substring(
				3,
				6
			)}-${number.substring(6)}`;
		}
		return phone;
	};

	const totalPages = opportunitiesData?.meta?.total
		? Math.ceil(opportunitiesData.meta.total / 20)
		: 0;

	// Error state with fixed height
	if (hasError) {
		return (
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 h-[600px] flex flex-col'>
				<h2 className='text-xl font-semibold dark:text-white mb-4 flex-shrink-0'>
					Open Opportunities
				</h2>
				<div className='border-t border-gray-200 dark:border-gray-700 pt-4 flex-1 flex items-center justify-center'>
					<div className='text-center'>
						<svg
							className='w-12 h-12 mx-auto text-red-400 dark:text-red-600 mb-4'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
							/>
						</svg>
						<p className='text-red-600 dark:text-red-400 font-medium'>
							Unable to load opportunities
						</p>
						<p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
							Please select a location first or try refreshing the page.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 h-[600px] flex flex-col'>
			{/* Fixed Header */}
			<div className='flex items-center justify-between mb-4 flex-shrink-0'>
				<h2 className='text-xl font-semibold dark:text-white'>
					Open Opportunities{" "}
					{opportunitiesData?.meta?.total && (
						<span className='text-sm font-normal text-gray-500 dark:text-gray-400'>
							({opportunitiesData.meta.total.toLocaleString()} total)
						</span>
					)}
				</h2>
				{isLoading && (
					<div className='h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
				)}
			</div>

			<div className='border-t border-gray-200 dark:border-gray-700 pt-4 flex-1 flex flex-col min-h-0'>
				{/* Scrollable Opportunities List */}
				{opportunitiesData?.opportunities?.length > 0 ? (
					<>
						<div className='flex-1 overflow-y-auto pr-2 -mr-2'>
							<div className='space-y-4 pb-4'>
								{opportunitiesData.opportunities.map((opportunity, index) => (
									<div
										key={opportunity.id}
										className='border-b border-gray-100 dark:border-gray-600 pb-4 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 rounded-lg transition-colors'>
										<div className='flex items-start justify-between'>
											<div className='flex-1'>
												<h3 className='font-medium text-gray-900 dark:text-white mb-2'>
													{opportunity.contact?.name || opportunity.name}
												</h3>

												<div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
													{opportunity.contact?.email && (
														<div className='flex items-center text-gray-600 dark:text-gray-300'>
															<svg
																className='w-4 h-4 mr-2 text-gray-400'
																fill='none'
																stroke='currentColor'
																viewBox='0 0 24 24'>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	strokeWidth={2}
																	d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
																/>
															</svg>
															<a
																href={`mailto:${opportunity.contact.email}`}
																className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate'>
																{opportunity.contact.email}
															</a>
														</div>
													)}

													{opportunity.contact?.phone && (
														<div className='flex items-center text-gray-600 dark:text-gray-300'>
															<svg
																className='w-4 h-4 mr-2 text-gray-400'
																fill='none'
																stroke='currentColor'
																viewBox='0 0 24 24'>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	strokeWidth={2}
																	d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
																/>
															</svg>
															<a
																href={`tel:${opportunity.contact.phone}`}
																className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
																{formatPhoneNumber(opportunity.contact.phone)}
															</a>
														</div>
													)}
												</div>

												<div className='flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400'>
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															opportunity.status === "open"
																? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
																: opportunity.status === "won"
																? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
																: opportunity.status === "lost"
																? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
																: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
														}`}>
														{opportunity.status}
													</span>
													<span>
														Value: $
														{(opportunity.monetaryValue || 0).toLocaleString()}
													</span>
												</div>
											</div>

											<div className='text-right text-xs text-gray-400 dark:text-gray-500'>
												#{index + 1 + (currentPage - 1) * 20}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Fixed Pagination Controls */}
						{opportunitiesData?.meta && (
							<div className='flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 mt-4'>
								<button
									onClick={handlePreviousPage}
									// disabled={!opportunitiesData.meta.prevPage || isLoading}
									className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
									<svg
										className='w-4 h-4 mr-2'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M15 19l-7-7 7-7'
										/>
									</svg>
									Previous
								</button>

								<div className='flex items-center space-x-2'>
									<span className='text-sm text-gray-600 dark:text-gray-300'>
										Page {currentPage} of {totalPages.toLocaleString()}
									</span>
									<span className='text-xs text-gray-400 dark:text-gray-500'>
										•
									</span>
									<span className='text-xs text-gray-400 dark:text-gray-500'>
										Showing {(currentPage - 1) * 20 + 1}-
										{Math.min(currentPage * 20, opportunitiesData.meta.total)}
										of {opportunitiesData.meta.total.toLocaleString()}
									</span>
								</div>

								<button
									onClick={handleNextPage}
									disabled={!opportunitiesData.meta.nextPage || isLoading}
									className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
									Next
									<svg
										className='w-4 h-4 ml-2'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 5l7 7-7 7'
										/>
									</svg>
								</button>
							</div>
						)}
					</>
				) : (
					<div className='flex-1 flex items-center justify-center'>
						<div className='text-center'>
							<svg
								className='w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4'
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
							<p className='text-gray-500 dark:text-gray-400'>
								No opportunities found
							</p>
							<p className='text-sm text-gray-400 dark:text-gray-500 mt-1'>
								Opportunities will appear here when they are created.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

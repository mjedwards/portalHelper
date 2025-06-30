/* eslint-disable prefer-const */
// src/app/(auth)/dashboard/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import GhlService from "@/utils/api/ghlService";
import { getDefaultLocation, getCompanyId } from "@/utils/api/authUtils.server";
import LocationSelector from "./components/LocationSelector";
import DashboardContent from "./components/DashboardContent";

interface DashboardData {
	calendars: any;
	opportunities: any;
	company: any;
	locationId: string;
	companyId: string | null;
}

export default async function DashboardPage() {
	try {
		// Get default location ID and company ID from cookies
		const [locationId, companyId] = await Promise.all([
			getDefaultLocation(),
			getCompanyId(),
		]);

		console.log("locationId", locationId);
		console.log("companyId", companyId);

		// Initialize data objects
		let dashboardData: Partial<DashboardData> = {
			calendars: null,
			opportunities: null,
			company: null,
			locationId: locationId || "",
			companyId: companyId || null,
		};

		// Fetch location-specific data if locationId exists
		if (locationId) {
			try {
				// Fetch calendars and opportunities in parallel
				const [calendarData, opportunitiesData] = await Promise.allSettled([
					GhlService.getCalendars(locationId),
					GhlService.getOpportunities(locationId, { limit: 20 }), // Fetch first page with 20 items
				]);

				// Handle calendar data
				if (calendarData.status === "fulfilled") {
					dashboardData.calendars = calendarData.value;
					console.log("✅ Calendar data fetched:", calendarData.value);
				} else {
					console.error(
						"❌ Failed to fetch calendar data:",
						calendarData.reason
					);
				}

				// Handle opportunities data
				if (opportunitiesData.status === "fulfilled") {
					dashboardData.opportunities = opportunitiesData.value;
					console.log("✅ Opportunities data fetched:", {
						count: opportunitiesData.value?.opportunities?.length || 0,
						total: opportunitiesData.value?.meta?.total || 0,
						currentPage: opportunitiesData.value?.meta?.currentPage || 1,
					});
				} else {
					console.error(
						"❌ Failed to fetch opportunities data:",
						opportunitiesData.reason
					);
				}
			} catch (err) {
				console.error("Error fetching location data:", err);
			}
		}

		// Try to fetch company data
		// if (companyId) {
		// 	try {
		// 		const companyData = await GhlService.getCompany(companyId);
		// 		dashboardData.company = companyData;
		// 		console.log("✅ Company data fetched:", companyData?.name || "No name");
		// 	} catch (err) {
		// 		console.error("❌ Failed to fetch company data:", err);
		// 		// Continue without company data
		// 	}
		// }

		// Handle case where no location is found
		if (!locationId) {
			return (
				<div className='space-y-6'>
					<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow'>
						<h1 className='text-2xl font-bold mb-4 dark:text-white'>
							Dashboard
						</h1>
						<div className='bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4'>
							<div className='flex'>
								<div className='flex-shrink-0'>
									<svg
										className='h-5 w-5 text-yellow-400'
										viewBox='0 0 20 20'
										fill='currentColor'>
										<path
											fillRule='evenodd'
											d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<div className='ml-3'>
									<h3 className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
										No Location Selected
									</h3>
									<p className='mt-1 text-sm text-yellow-700 dark:text-yellow-300'>
										Please select a location to view your dashboard data.
									</p>
								</div>
							</div>
						</div>
						<div className='mt-4'>
							<LocationSelector />
						</div>
					</div>
					<DashboardContent
						companyData={dashboardData.company}
						opportunitiesData={dashboardData.opportunities}
						calendarsData={dashboardData.calendars}
						locationId={dashboardData.locationId ?? ""}
						hasLocationError={true}
					/>
				</div>
			);
		}

		// Render dashboard with data
		return (
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<h1 className='text-2xl font-bold dark:text-white'>
						Dashboard
						{dashboardData.opportunities?.meta?.total && (
							<span className='text-lg font-normal text-gray-500 dark:text-gray-400 ml-2'>
								({dashboardData.opportunities.meta.total.toLocaleString()}{" "}
								opportunities)
							</span>
						)}
					</h1>
					<LocationSelector currentLocationId={locationId} />
				</div>

				{/* Show data loading status */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
					<div
						className={`p-3 rounded-lg border ${
							dashboardData.calendars
								? "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700"
								: "bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700"
						}`}>
						<div className='flex items-center'>
							<div
								className={`w-2 h-2 rounded-full mr-2 ${
									dashboardData.calendars ? "bg-green-500" : "bg-red-500"
								}`}></div>
							<span
								className={`text-sm font-medium ${
									dashboardData.calendars
										? "text-green-800 dark:text-green-200"
										: "text-red-800 dark:text-red-200"
								}`}>
								Calendars: {dashboardData.calendars ? "Loaded" : "Failed"}
							</span>
						</div>
					</div>

					<div
						className={`p-3 rounded-lg border ${
							dashboardData.opportunities
								? "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700"
								: "bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700"
						}`}>
						<div className='flex items-center'>
							<div
								className={`w-2 h-2 rounded-full mr-2 ${
									dashboardData.opportunities ? "bg-green-500" : "bg-red-500"
								}`}></div>
							<span
								className={`text-sm font-medium ${
									dashboardData.opportunities
										? "text-green-800 dark:text-green-200"
										: "text-red-800 dark:text-red-200"
								}`}>
								Opportunities:{" "}
								{dashboardData.opportunities ? "Loaded" : "Failed"}
							</span>
						</div>
					</div>

					<div
						className={`p-3 rounded-lg border ${
							dashboardData.company
								? "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700"
								: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700"
						}`}>
						<div className='flex items-center'>
							<div
								className={`w-2 h-2 rounded-full mr-2 ${
									dashboardData.company ? "bg-green-500" : "bg-yellow-500"
								}`}></div>
							<span
								className={`text-sm font-medium ${
									dashboardData.company
										? "text-green-800 dark:text-green-200"
										: "text-yellow-800 dark:text-yellow-200"
								}`}>
								Company: {dashboardData.company ? "Loaded" : "Optional"}
							</span>
						</div>
					</div>
				</div>

				<DashboardContent
					companyData={dashboardData.company}
					opportunitiesData={dashboardData.opportunities}
					calendarsData={dashboardData.calendars}
					locationId={dashboardData.locationId as string}
					hasLocationError={false}
				/>
			</div>
		);
	} catch (error: any) {
		console.error("❌ Critical error loading dashboard:", error);

		return (
			<div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow'>
				<h1 className='text-2xl font-bold mb-4 dark:text-white'>Dashboard</h1>
				<div className='bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4'>
					<div className='flex'>
						<div className='flex-shrink-0'>
							<svg
								className='h-5 w-5 text-red-400'
								viewBox='0 0 20 20'
								fill='currentColor'>
								<path
									fillRule='evenodd'
									d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
									clipRule='evenodd'
								/>
							</svg>
						</div>
						<div className='ml-3'>
							<h3 className='text-sm font-medium text-red-800 dark:text-red-200'>
								Dashboard Error
							</h3>
							<div className='mt-2 text-sm text-red-700 dark:text-red-300'>
								<p>Error loading dashboard: {error.message}</p>
								<p className='mt-1'>
									Please refresh the page or try logging in again.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Show minimal LocationSelector for recovery */}
				<div className='mt-6'>
					<LocationSelector />
				</div>
			</div>
		);
	}
}

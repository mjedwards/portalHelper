import { redirect } from "next/navigation";
import { isAuthenticated, getLocations } from "@/utils/api/authUtils.server";

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Check if user is authenticated with GHL
	const authenticated = await isAuthenticated();

	if (!authenticated) {
		// Redirect to login if not authenticated
		redirect("/login");
	}

	// Check if we have locations (app is installed)
	const locations = await getLocations();

	if (!locations || locations.length === 0) {
		// If authenticated but no locations, we need to fetch locations
		// This is an edge case but could happen if cookies get out of sync
		redirect("/api/ghl/refresh-locations");
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
				{children}
			</div>
		</div>
	);
}

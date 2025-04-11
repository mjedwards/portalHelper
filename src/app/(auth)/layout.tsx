/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideNav from "@/components/layout/SideNav"; // Import your new SideNav component
// If you have a hook or utility for checking authentication:
// import { useAuth } from '@/hooks/useAuth';

export default function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	// Uncommment if you have authentication:
	// const { isAuthenticated, loading } = useAuth();
	const [isAuthenticated, setIsAuthenticated] = useState(true); // Replace with actual auth check
	const [loading, setLoading] = useState(false); // Replace with actual loading state

	useEffect(() => {
		// If not authenticated and not loading, redirect to sign-in
		if (!isAuthenticated && !loading) {
			router.push("/"); // or wherever your sign-in page is
		}
	}, [isAuthenticated, loading, router]);

	// Show loading state while checking auth
	if (loading) {
		return <div>Loading...</div>;
	}

	// If authenticated, show the layout with SideNav
	if (isAuthenticated) {
		return (
			<>
				<SideNav />
				<main className='p-4 sm:ml-64 pt-20'>{children}</main>
			</>
		);
	}

	// Fallback while redirecting
	return null;
}

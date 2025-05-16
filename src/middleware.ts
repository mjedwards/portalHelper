import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	// Check for auth cookies
	const accessToken = request.cookies.get("ghl_access_token")?.value;
	const refreshToken = request.cookies.get("ghl_refresh_token")?.value;

	// Get the path being requested
	const path = request.nextUrl.pathname;

	// For API routes, strictly enforce authentication
	if (path.startsWith("/api/ghl/")) {
		if (!accessToken && !refreshToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
	}

	// For protected pages, redirect to login
	else if (
		(path.startsWith("/dashboard") ||
			path.startsWith("/settings") ||
			path.startsWith("/reports")) &&
		!accessToken &&
		!refreshToken
	) {
		const loginUrl = new URL("/login", request.url);
		// Remember the page they tried to visit
		loginUrl.searchParams.set("callbackUrl", encodeURIComponent(request.url));
		return NextResponse.redirect(loginUrl);
	}

	// Continue for authenticated requests or public routes
	return NextResponse.next();
}

// Configure which routes are checked by the middleware
export const config = {
	matcher: [
		"/dashboard/:path*",
		"/settings/:path*",
		"/reports/:path*",
		"/api/ghl/:path*",
	],
};

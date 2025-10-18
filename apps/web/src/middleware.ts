import { auth } from "@mumbaihacks/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerCaller } from "@/server/trpc";
import { user } from "@mumbaihacks/db";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const caller = await createServerCaller();

	// Get session
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	// Protect dashboard routes
	if (pathname.startsWith("/dashboard")) {
		// If no session, redirect to login
		if (!session?.user) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		const userRole = session.user.role;
		if (userRole === "patient") {
			const record = await caller.patients.getDemographics(({ userId: session.user.id }));
			if (!record) {
				return NextResponse.redirect(new URL("/onboarding", request.url));
			}
		}

		// Admin route protection
		if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		// Clinician route protection
		if (pathname.startsWith("/dashboard/clinician") && userRole !== "clinician") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		// Patient route protection
		if (pathname.startsWith("/dashboard/patient") && userRole !== "patient") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	runtime: "nodejs",
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};

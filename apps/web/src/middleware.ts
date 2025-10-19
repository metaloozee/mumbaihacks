import { auth } from "@mumbaihacks/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerCaller } from "@/server/trpc";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: False Positive
export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const session = await auth.api.getSession({
		headers: request.headers,
	});

	// Only fetch demographics when needed: on /onboarding or /dashboard routes and only for patients
	let record: Awaited<
		ReturnType<Awaited<ReturnType<typeof createServerCaller>>["patients"]["getDemographics"]>
	> | null = null;
	const needsDemographics =
		(pathname.startsWith("/onboarding") || pathname.startsWith("/dashboard")) && session?.user?.role === "patient";

	if (needsDemographics && session?.user) {
		try {
			const caller = await createServerCaller();
			record = await caller.patients.getDemographics({ userId: session.user.id });
		} catch {
			// Continues
		}
	}

	if (pathname.startsWith("/onboarding")) {
		if (!session?.user) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
		if (record || session.user.role !== "patient") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	if (pathname.startsWith("/dashboard")) {
		if (!session?.user) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		const userRole = session.user.role;
		if (userRole === "patient" && !record) {
			return NextResponse.redirect(new URL("/onboarding", request.url));
		}

		if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		if (pathname.startsWith("/dashboard/clinician") && userRole !== "clinician") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

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

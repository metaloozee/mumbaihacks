import { auth } from "@mumbaihacks/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	// Redirect to role-specific dashboard
	const role = session.user.role;

	if (role === "admin") {
		redirect("/dashboard/admin");
	}

	if (role === "clinician") {
		redirect("/dashboard/clinician");
	}

	if (role === "patient") {
		redirect("/dashboard/patient");
	}

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="font-bold text-2xl">Access Denied</h1>
				<p className="mt-2 text-muted-foreground">
					Your account role is not recognized. Please contact support.
				</p>
			</div>
		</div>
	);
}

import { auth } from "@mumbaihacks/auth";
import { Calendar, FileText, Plus, Users } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppointmentsTable } from "@/components/dashboard/appointments-table";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClinicianDashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	// Type assertion for role check - role is added via better-auth additionalFields
	const userRole = (session.user as { role?: string }).role;
	if (userRole !== "clinician") {
		redirect("/dashboard");
	}

	// TODO: Fetch real data using tRPC
	const stats = {
		totalPatients: 0,
		upcomingAppointments: 0,
		recentRecords: 0,
	};

	const recentAppointments: Array<{
		id: string;
		patientName: string;
		scheduledAt: string;
		status: string;
	}> = [];

	return (
		<div className="flex-1 space-y-8 p-8">
			<DashboardBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clinician" }]} />

			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Welcome back, {session.user.name}</h1>
					<p className="mt-2 text-muted-foreground">Here is an overview of your practice</p>
				</div>
				<Link href="/dashboard/clinician/appointments">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						New Appointment
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<StatsCard
					description="Active patients under your care"
					icon={Users}
					title="Total Patients"
					value={stats.totalPatients}
				/>
				<StatsCard
					description="Scheduled for this week"
					icon={Calendar}
					title="Upcoming Appointments"
					value={stats.upcomingAppointments}
				/>
				<StatsCard
					description="Created this month"
					icon={FileText}
					title="Recent Records"
					value={stats.recentRecords}
				/>
			</div>

			{/* Recent Appointments */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Recent Appointments</CardTitle>
					<Link href="/dashboard/clinician/appointments">
						<Button size="sm" variant="outline">
							View All
						</Button>
					</Link>
				</CardHeader>
				<CardContent>
					<AppointmentsTable appointments={recentAppointments} emptyMessage="No appointments scheduled" />
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-3">
				<Link href="/dashboard/clinician/patients">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<CardHeader>
							<CardTitle className="flex items-center">
								<Users className="mr-2 h-5 w-5" />
								Manage Patients
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">View and manage your patient list</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/dashboard/clinician/records">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<CardHeader>
							<CardTitle className="flex items-center">
								<FileText className="mr-2 h-5 w-5" />
								Medical Records
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">Access and create medical records</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/dashboard/clinician/prescriptions">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<CardHeader>
							<CardTitle className="flex items-center">
								<FileText className="mr-2 h-5 w-5" />
								Prescriptions
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">Manage prescriptions and medications</p>
						</CardContent>
					</Card>
				</Link>
			</div>
		</div>
	);
}

import { auth } from "@mumbaihacks/auth";
import { Calendar, FileText, Plus, Users } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppointmentsTable } from "@/components/dashboard/appointments-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Link href="/dashboard/clinician/appointments">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								New Appointment
							</Button>
						</Link>
					}
					breadcrumbItems={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clinician" }]}
					description="Here is an overview of your practice"
					icon={<Users className="h-8 w-8" />}
					title={`Welcome back, ${session.user.name}`}
				/>
			}
		>
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<StatsCard
					description="Active patients under your care"
					icon={<Users className="h-4 w-4" />}
					title="Total Patients"
					value={stats.totalPatients}
				/>
				<StatsCard
					description="Scheduled for this week"
					icon={<Calendar className="h-4 w-4" />}
					title="Upcoming Appointments"
					value={stats.upcomingAppointments}
				/>
				<StatsCard
					description="Created this month"
					icon={<FileText className="h-4 w-4" />}
					title="Recent Records"
					value={stats.recentRecords}
				/>
			</div>

			{/* Recent Appointments */}
			<ListCard
				actions={
					<Link href="/dashboard/clinician/appointments">
						<Button size="sm" variant="outline">
							View All
						</Button>
					</Link>
				}
				title="Recent Appointments"
			>
				<AppointmentsTable appointments={recentAppointments} emptyMessage="No appointments scheduled" />
			</ListCard>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-3">
				<Link href="/dashboard/clinician/patients">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<Users className="mr-2 h-5 w-5" />
								Manage Patients
							</div>
							<p className="mt-2 text-muted-foreground text-sm">View and manage your patient list</p>
						</div>
					</Card>
				</Link>

				<Link href="/dashboard/clinician/records">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<FileText className="mr-2 h-5 w-5" />
								Medical Records
							</div>
							<p className="mt-2 text-muted-foreground text-sm">Access and create medical records</p>
						</div>
					</Card>
				</Link>

				<Link href="/dashboard/clinician/prescriptions">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<FileText className="mr-2 h-5 w-5" />
								Prescriptions
							</div>
							<p className="mt-2 text-muted-foreground text-sm">Manage prescriptions and medications</p>
						</div>
					</Card>
				</Link>
			</div>
		</DashboardPageShell>
	);
}

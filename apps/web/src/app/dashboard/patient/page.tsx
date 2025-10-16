import { auth } from "@mumbaihacks/auth";
import { Calendar, FileText, Pill } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/date-utils";

const UPCOMING_APPOINTMENTS_LIMIT = 3;
const ACTIVE_PRESCRIPTIONS_LIMIT = 3;

export default async function PatientDashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role !== "patient") {
		redirect("/dashboard");
	}

	// TODO: Fetch real data using tRPC
	const stats = {
		upcomingAppointments: 0,
		medicalRecords: 0,
		activePrescriptions: 0,
	};

	const upcomingAppointments: Array<{
		id: string;
		clinicianName: string;
		scheduledAt: string;
		status: string;
	}> = [];

	const activePrescriptions: Array<{
		id: string;
		medication: string;
		dosage: string;
		expiryDate: string;
	}> = [];

	return (
		<DashboardPageShell
			header={
				<PageHeader
					breadcrumbItems={[{ label: "Dashboard", href: "/dashboard" }, { label: "Patient" }]}
					description="Your health dashboard overview"
					icon={<Calendar className="h-8 w-8" />}
					title={`Welcome back, ${session.user.name ?? "User"}`}
				/>
			}
		>
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<StatsCard
					description="Scheduled appointments"
					icon={<Calendar className="h-4 w-4" />}
					title="Upcoming Appointments"
					value={stats.upcomingAppointments}
				/>
				<StatsCard
					description="Total records"
					icon={<FileText className="h-4 w-4" />}
					title="Medical Records"
					value={stats.medicalRecords}
				/>
				<StatsCard
					description="Current medications"
					icon={<Pill className="h-4 w-4" />}
					title="Active Prescriptions"
					value={stats.activePrescriptions}
				/>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Upcoming Appointments */}
				<ListCard
					actions={
						<Link className="text-primary text-sm hover:underline" href="/dashboard/patient/appointments">
							View all
						</Link>
					}
					title="Upcoming Appointments"
				>
					{upcomingAppointments.length === 0 ? (
						<div className="py-6 text-center text-muted-foreground">No upcoming appointments</div>
					) : (
						<div className="space-y-4">
							{upcomingAppointments.slice(0, UPCOMING_APPOINTMENTS_LIMIT).map((appointment) => (
								<div
									className="flex items-center justify-between border-b pb-3 last:border-0"
									key={appointment.id}
								>
									<div>
										<p className="font-medium">{appointment.clinicianName}</p>
										<p className="text-muted-foreground text-sm">
											{formatDateTime(appointment.scheduledAt)}
										</p>
									</div>
									<Badge>{appointment.status}</Badge>
								</div>
							))}
						</div>
					)}
				</ListCard>

				{/* Active Prescriptions */}
				<ListCard
					actions={
						<Link className="text-primary text-sm hover:underline" href="/dashboard/patient/prescriptions">
							View all
						</Link>
					}
					title="Active Prescriptions"
				>
					{activePrescriptions.length === 0 ? (
						<div className="py-6 text-center text-muted-foreground">No active prescriptions</div>
					) : (
						<div className="space-y-4">
							{activePrescriptions.slice(0, ACTIVE_PRESCRIPTIONS_LIMIT).map((prescription) => (
								<div
									className="flex items-center justify-between border-b pb-3 last:border-0"
									key={prescription.id}
								>
									<div>
										<p className="font-medium">{prescription.medication}</p>
										<p className="text-muted-foreground text-sm">{prescription.dosage}</p>
									</div>
									<p className="text-muted-foreground text-xs">
										Expires: {formatDate(prescription.expiryDate)}
									</p>
								</div>
							))}
						</div>
					)}
				</ListCard>
			</div>

			{/* Quick Links */}
			<div className="grid gap-4 md:grid-cols-3">
				<Link href="/dashboard/patient/appointments">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<Calendar className="mr-2 h-5 w-5" />
								My Appointments
							</div>
							<p className="mt-2 text-muted-foreground text-sm">View all your scheduled appointments</p>
						</div>
					</Card>
				</Link>

				<Link href="/dashboard/patient/records">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<FileText className="mr-2 h-5 w-5" />
								Medical Records
							</div>
							<p className="mt-2 text-muted-foreground text-sm">Access your medical history</p>
						</div>
					</Card>
				</Link>

				<Link href="/dashboard/patient/prescriptions">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<Pill className="mr-2 h-5 w-5" />
								Prescriptions
							</div>
							<p className="mt-2 text-muted-foreground text-sm">View your prescription history</p>
						</div>
					</Card>
				</Link>
			</div>
		</DashboardPageShell>
	);
}

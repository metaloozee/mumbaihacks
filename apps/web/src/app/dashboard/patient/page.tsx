import { auth } from "@mumbaihacks/auth";
import { Calendar, FileText, Pill } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
		<div className="flex-1 space-y-8 p-8">
			<DashboardBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Patient" }]} />

			<div>
				<h1 className="font-bold text-3xl tracking-tight">Welcome back, {session.user.name}</h1>
				<p className="mt-2 text-muted-foreground">Your health dashboard overview</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<StatsCard
					description="Scheduled appointments"
					icon={Calendar}
					title="Upcoming Appointments"
					value={stats.upcomingAppointments}
				/>
				<StatsCard
					description="Total records"
					icon={FileText}
					title="Medical Records"
					value={stats.medicalRecords}
				/>
				<StatsCard
					description="Current medications"
					icon={Pill}
					title="Active Prescriptions"
					value={stats.activePrescriptions}
				/>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Upcoming Appointments */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Upcoming Appointments</CardTitle>
						<Link className="text-primary text-sm hover:underline" href="/dashboard/patient/appointments">
							View all
						</Link>
					</CardHeader>
					<CardContent>
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
												{new Date(appointment.scheduledAt).toLocaleString("en-US", {
													dateStyle: "medium",
													timeStyle: "short",
												})}
											</p>
										</div>
										<Badge>{appointment.status}</Badge>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Active Prescriptions */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Active Prescriptions</CardTitle>
						<Link className="text-primary text-sm hover:underline" href="/dashboard/patient/prescriptions">
							View all
						</Link>
					</CardHeader>
					<CardContent>
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
											Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
										</p>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Quick Links */}
			<div className="grid gap-4 md:grid-cols-3">
				<Link href="/dashboard/patient/appointments">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<CardHeader>
							<CardTitle className="flex items-center">
								<Calendar className="mr-2 h-5 w-5" />
								My Appointments
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">View all your scheduled appointments</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/dashboard/patient/records">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<CardHeader>
							<CardTitle className="flex items-center">
								<FileText className="mr-2 h-5 w-5" />
								Medical Records
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">Access your medical history</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/dashboard/patient/prescriptions">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<CardHeader>
							<CardTitle className="flex items-center">
								<Pill className="mr-2 h-5 w-5" />
								Prescriptions
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">View your prescription history</p>
						</CardContent>
					</Card>
				</Link>
			</div>
		</div>
	);
}

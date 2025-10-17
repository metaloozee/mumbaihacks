"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Calendar, FileText, FlaskConical, Plus, UserRoundCheck, Users } from "lucide-react";
import Link from "next/link";
import { AppointmentsTable } from "@/components/dashboard/appointments-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

type AppointmentWithPatient = {
	id: string;
	patientId: string;
	clinicianId: string;
	scheduledAt: string;
	status: "pending" | "confirmed" | "completed" | "cancelled";
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	patientName?: string;
};

export default function ClinicianDashboardPage() {
	const { data: session } = authClient.useSession();
	const { data: patients } = useQuery(trpc.patients.list.queryOptions());
	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions()) as {
		data: AppointmentWithPatient[] | undefined;
	};
	const { data: medicalRecords } = useQuery(trpc.medicalRecords.list.queryOptions());

	const stats = {
		totalPatients: patients?.length || 0,
		upcomingAppointments:
			appointments?.filter((a) => a.status === "pending" || a.status === "confirmed").length || 0,
		recentRecords: medicalRecords?.length || 0,
	};

	const RECENT_APPOINTMENTS_LIMIT = 5;
	const recentAppointments =
		appointments?.slice(0, RECENT_APPOINTMENTS_LIMIT).map((a) => ({
			id: a.id,
			patientName: a.patientName || "Unknown",
			scheduledAt: a.scheduledAt,
			status: a.status,
		})) || [];

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Link href="/dashboard/clinician/appointments/new">
							<Button>
								<Plus className="h-4 w-4" />
								New Appointment
							</Button>
						</Link>
					}
					breadcrumbItems={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clinician" }]}
					description="Here is an overview of your practice"
					icon={<Users className="h-8 w-8" />}
					title={`Welcome back ${session?.user?.name}`}
				/>
			}
		>
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

				<Link href="/dashboard/clinician/assessments">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<Activity className="mr-2 h-5 w-5" />
								Assessments
							</div>
							<p className="mt-2 text-muted-foreground text-sm">Initial assessments and vital signs</p>
						</div>
					</Card>
				</Link>

				<Link href="/dashboard/clinician/orders">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<FlaskConical className="mr-2 h-5 w-5" />
								Medical Orders
							</div>
							<p className="mt-2 text-muted-foreground text-sm">Lab and imaging orders</p>
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

				<Link href="/dashboard/clinician/discharge">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<UserRoundCheck className="mr-2 h-5 w-5" />
								Discharge Summaries
							</div>
							<p className="mt-2 text-muted-foreground text-sm">Patient discharge documentation</p>
						</div>
					</Card>
				</Link>
			</div>
		</DashboardPageShell>
	);
}

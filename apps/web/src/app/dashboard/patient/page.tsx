"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, Pill } from "lucide-react";
import Link from "next/link";
import { format } from "timeago.js";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

const UPCOMING_APPOINTMENTS_LIMIT = 3;
const ACTIVE_PRESCRIPTIONS_LIMIT = 3;

export default function PatientDashboardPage() {
	const { data: session } = authClient.useSession();
	const { data: appointments, isLoading: appointmentsLoading } = useQuery(trpc.appointments.list.queryOptions());
	const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery(trpc.prescriptions.list.queryOptions());
	const { data: medicalRecords, isLoading: recordsLoading } = useQuery(trpc.medicalRecords.list.queryOptions());

	const upcomingAppointments =
		appointments
			?.filter((a) => {
				const isPendingOrConfirmed = a.status === "pending" || a.status === "confirmed";
				const isFuture = new Date(a.scheduledAt as string) > new Date();
				return isPendingOrConfirmed && isFuture;
			})
			.sort((a, b) => new Date(a.scheduledAt as string).getTime() - new Date(b.scheduledAt as string).getTime())
			.slice(0, UPCOMING_APPOINTMENTS_LIMIT) || [];

	// Filter active prescriptions
	const activePrescriptions =
		prescriptions?.filter((p) => p.status === "active").slice(0, ACTIVE_PRESCRIPTIONS_LIMIT) || [];

	const stats = {
		upcomingAppointments:
			appointments?.filter((a) => a.status === "pending" || a.status === "confirmed").length || 0,
		medicalRecords: medicalRecords?.length || 0,
		activePrescriptions: prescriptions?.filter((p) => p.status === "active").length || 0,
	};

	const isLoading = appointmentsLoading || prescriptionsLoading || recordsLoading;

	if (isLoading) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[{ label: "Dashboard", href: "/dashboard" }, { label: "Patient" }]}
						description="Your health dashboard overview"
						icon={<Calendar className="h-8 w-8" />}
						title="Loading..."
					/>
				}
			>
				<div className="py-8 text-center text-muted-foreground">Loading dashboard...</div>
			</DashboardPageShell>
		);
	}

	return (
		<DashboardPageShell
			header={
				<PageHeader
					breadcrumbItems={[{ label: "Dashboard", href: "/dashboard" }, { label: "Patient" }]}
					description="Your health dashboard overview"
					icon={<Calendar className="h-8 w-8" />}
					title={`Welcome back, ${session?.user?.name ?? "User"}`}
				/>
			}
		>
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
							{upcomingAppointments.map((appointment) => (
								<Link
									className="flex w-full flex-row items-center justify-between"
									href={`/dashboard/patient/appointments/${appointment.id}`}
									key={appointment.id as string}
								>
									<Card className="flex w-full flex-row items-center justify-between">
										<CardHeader className="flex w-full flex-col gap-1">
											<p className="font-medium">
												Dr.{" "}
												{(appointment as typeof appointment & { clinicianName?: string })
													.clinicianName || "Unknown"}
											</p>
											<p className="text-muted-foreground text-xs">
												{format(appointment.scheduledAt as string)}
											</p>
										</CardHeader>
										<CardFooter>
											<Badge>
												{appointment.status.charAt(0).toUpperCase() +
													appointment.status.slice(1)}
											</Badge>
										</CardFooter>
									</Card>
								</Link>
							))}
						</div>
					)}
				</ListCard>

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
							{activePrescriptions.map((prescription) => (
								<Link
									className="flex w-full flex-row items-center justify-between"
									href={`/dashboard/patient/prescriptions/${prescription.id}`}
									key={prescription.id}
								>
									<Card className="flex w-full flex-row items-center justify-between">
										<CardHeader className="flex w-full flex-col gap-1">
											<p className="font-medium">{prescription.medication}</p>
											<p className="text-muted-foreground text-sm">{prescription.dosage}</p>
										</CardHeader>
										<CardFooter className="gap-2">
											<Badge variant={"secondary"}>
												Expires {format(prescription.expiryDate)}
											</Badge>
											<Badge>
												{prescription.status.charAt(0).toUpperCase() +
													prescription.status.slice(1)}
											</Badge>
										</CardFooter>
									</Card>
								</Link>
							))}
						</div>
					)}
				</ListCard>
			</div>

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

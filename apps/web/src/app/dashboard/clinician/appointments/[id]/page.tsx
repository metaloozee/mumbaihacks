"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/date-utils";
import { trpc, trpcClient } from "@/utils/trpc";

export default function AppointmentDetailPage() {
	const params = useParams();
	const appointmentId = params.id as string;

	const {
		data: appointment,
		isLoading,
		refetch,
	} = useQuery(trpc.appointments.getById.queryOptions({ id: appointmentId }));

	const updateAppointment = useMutation({
		mutationFn: (data: { id: string; status: "pending" | "confirmed" | "completed" | "cancelled" }) =>
			trpcClient.appointments.update.mutate(data),
		onSuccess: () => {
			toast.success("Appointment updated successfully!");
			refetch();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update appointment");
		},
	});

	if (isLoading) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Clinician", href: "/dashboard/clinician" },
							{ label: "Appointments", href: "/dashboard/clinician/appointments" },
							{ label: "Details" },
						]}
						icon={<Calendar className="h-8 w-8" />}
						title="Appointment Details"
					/>
				}
			>
				<div className="py-8 text-center text-muted-foreground">Loading appointment...</div>
			</DashboardPageShell>
		);
	}

	if (!appointment) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Clinician", href: "/dashboard/clinician" },
							{ label: "Appointments", href: "/dashboard/clinician/appointments" },
							{ label: "Details" },
						]}
						icon={<Calendar className="h-8 w-8" />}
						title="Appointment Details"
					/>
				}
			>
				<div className="py-8 text-center text-destructive">Appointment not found</div>
			</DashboardPageShell>
		);
	}

	const statusColors: Record<string, string> = {
		pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
		confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
	};

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Button asChild variant="outline">
							<Link href="/dashboard/clinician/appointments">
								<ArrowLeft className="h-4 w-4" />
								Back to Appointments
							</Link>
						</Button>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Clinician", href: "/dashboard/clinician" },
						{ label: "Appointments", href: "/dashboard/clinician/appointments" },
						{ label: "Details" },
					]}
					description="View and manage appointment details"
					icon={<Calendar className="h-8 w-8" />}
					title="Appointment Details"
				/>
			}
		>
			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Appointment Information</CardTitle>
								<CardDescription>Details about this appointment</CardDescription>
							</div>
							<Badge className={statusColors[appointment.status]}>
								{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Patient</h4>
								<p className="font-medium text-base">{appointment.patientName}</p>
								<p className="text-muted-foreground text-sm">{appointment.patientEmail}</p>
							</div>
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">
									Scheduled Date & Time
								</h4>
								<p className="text-base">{formatDateTime(appointment.scheduledAt)}</p>
							</div>
						</div>

						{appointment.notes ? (
							<div>
								<h4 className="mb-2 font-medium text-muted-foreground text-sm">Notes</h4>
								<p className="whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm">
									{appointment.notes}
								</p>
							</div>
						) : (
							<div>
								<h4 className="mb-2 font-medium text-muted-foreground text-sm">Notes</h4>
								<p className="text-muted-foreground text-sm italic">No notes added</p>
							</div>
						)}

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Created</h4>
								<p className="text-sm">
									{new Date(appointment.createdAt).toLocaleString("en-US", {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</p>
							</div>
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Last Updated</h4>
								<p className="text-sm">
									{new Date(appointment.updatedAt).toLocaleString("en-US", {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Update Status</CardTitle>
						<CardDescription>Change the status of this appointment</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							<Select
								disabled={updateAppointment.isPending}
								onValueChange={(value) =>
									updateAppointment.mutate({
										id: appointmentId,
										status: value as "pending" | "confirmed" | "completed" | "cancelled",
									})
								}
								value={appointment.status}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="confirmed">Confirmed</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
							{updateAppointment.isPending ? (
								<span className="text-muted-foreground text-sm">Updating...</span>
							) : null}
						</div>
					</CardContent>
				</Card>

				<div className="flex gap-4">
					<Button asChild variant="outline">
						<Link href={`/dashboard/clinician/records?patientId=${appointment.patientId}`}>
							View Patient Records
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href={`/dashboard/clinician/prescriptions/new?appointmentId=${appointmentId}`}>
							Create Prescription
						</Link>
					</Button>
				</div>
			</div>
		</DashboardPageShell>
	);
}

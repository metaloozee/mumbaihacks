"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CancelAppointmentDialog } from "@/components/dashboard/cancel-appointment-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date-utils";
import { trpc, trpcClient } from "@/utils/trpc";

export default function PatientAppointmentDetailPage() {
	const params = useParams();
	const appointmentId = params.id as string;
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

	const {
		data: appointment,
		isLoading,
		refetch,
	} = useQuery(trpc.appointments.getById.queryOptions({ id: appointmentId }));

	const cancelAppointment = useMutation({
		mutationFn: (data: { id: string; status: "cancelled"; cancellationReason: string }) =>
			trpcClient.appointments.update.mutate(data),
		onSuccess: () => {
			toast.success("Appointment cancelled successfully!");
			refetch();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to cancel appointment");
		},
	});

	const handleCancelConfirm = (reason: string) => {
		cancelAppointment.mutate({
			id: appointmentId,
			status: "cancelled",
			cancellationReason: reason,
		});
	};

	if (isLoading) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Appointments", href: "/dashboard/patient/appointments" },
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
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Appointments", href: "/dashboard/patient/appointments" },
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
		<>
			<DashboardPageShell
				header={
					<PageHeader
						actions={
							<Button asChild variant="outline">
								<Link href="/dashboard/patient/appointments">
									<ArrowLeft className="h-4 w-4" />
									Back to Appointments
								</Link>
							</Button>
						}
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Appointments", href: "/dashboard/patient/appointments" },
							{ label: "Details" },
						]}
						description="View appointment details"
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
									<CardDescription>Details about your appointment</CardDescription>
								</div>
								<Badge className={statusColors[appointment.status]}>
									{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Clinician</h4>
									<p className="font-medium text-base">
										Dr. {appointment.clinicianName || "Unknown"}
									</p>
									<p className="text-muted-foreground text-sm">{appointment.clinicianEmail}</p>
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

							{appointment.cancellationReason && (
								<div>
									<h4 className="mb-2 font-medium text-muted-foreground text-sm">
										Cancellation Reason
									</h4>
									<p className="whitespace-pre-wrap rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
										{appointment.cancellationReason}
									</p>
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

					{appointment.status === "pending" && (
						<Card>
							<CardHeader>
								<CardTitle>Actions</CardTitle>
								<CardDescription>Manage this appointment</CardDescription>
							</CardHeader>
							<CardContent>
								<Button onClick={() => setCancelDialogOpen(true)} variant="destructive">
									Cancel Appointment
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</DashboardPageShell>

			<CancelAppointmentDialog
				appointment={
					appointment
						? {
								id: appointment.id,
								scheduledAt: appointment.scheduledAt,
								clinicianName: appointment.clinicianName,
							}
						: null
				}
				isLoading={cancelAppointment.isPending}
				onConfirm={handleCancelConfirm}
				onOpenChange={setCancelDialogOpen}
				open={cancelDialogOpen}
				userRole="patient"
			/>
		</>
	);
}

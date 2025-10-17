"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CancelAppointmentDialog } from "@/components/dashboard/cancel-appointment-dialog";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc, trpcClient } from "@/utils/trpc";

type Appointment = {
	id: string;
	clinicianName?: string;
	scheduledAt: string;
	status: "pending" | "confirmed" | "completed" | "cancelled";
	notes?: string | null;
	cancellationReason?: string | null;
};

export default function PatientAppointmentsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

	const { data: appointments, isLoading, refetch } = useQuery(trpc.appointments.list.queryOptions());

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

	const filteredAppointments =
		statusFilter === "all" ? appointments || [] : (appointments || []).filter((apt) => apt.status === statusFilter);

	const handleCancelClick = (appointment: Appointment) => {
		setSelectedAppointment(appointment);
		setCancelDialogOpen(true);
	};

	const handleCancelConfirm = (reason: string) => {
		if (selectedAppointment) {
			cancelAppointment.mutate({
				id: selectedAppointment.id,
				status: "cancelled",
				cancellationReason: reason,
			});
		}
	};

	const columns: ColumnDef<Appointment>[] = [
		{
			accessorKey: "clinicianName",
			header: "Clinician",
			cell: ({ getValue }) => {
				const clinicianName = getValue() as string | undefined;
				return <span className="font-medium">Dr. {clinicianName || "Unknown"}</span>;
			},
		},
		{
			accessorKey: "scheduledAt",
			header: "Date & Time",
			cell: ({ getValue }) => {
				const dateStr = getValue() as string;
				const date = new Date(dateStr);
				if (Number.isNaN(date.getTime())) {
					return <span className="text-destructive">Invalid date</span>;
				}
				return date.toLocaleString("en-US", {
					dateStyle: "medium",
					timeStyle: "short",
				});
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ getValue }) => {
				const status = getValue() as string;
				return <Badge>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
			},
		},
		{
			accessorKey: "notes",
			header: "Notes",
			cell: ({ getValue }) => {
				const notes = getValue() as string | null | undefined;
				return <span className="text-muted-foreground text-sm">{notes || "No notes"}</span>;
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex gap-2">
					<Button asChild size="sm" variant="outline">
						<Link href={`/dashboard/patient/appointments/${row.original.id}`}>View</Link>
					</Button>
					{row.original.status === "pending" && (
						<Button onClick={() => handleCancelClick(row.original)} size="sm" variant="destructive">
							Cancel
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<>
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Appointments" },
						]}
						description="View your scheduled appointments"
						icon={<Calendar className="h-8 w-8" />}
						title="My Appointments"
					/>
				}
			>
				<ListCard
					actions={
						<Select onValueChange={setStatusFilter} value={statusFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="confirmed">Confirmed</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="cancelled">Cancelled</SelectItem>
							</SelectContent>
						</Select>
					}
					title="All Appointments"
				>
					{isLoading ? (
						<div className="py-8 text-center text-muted-foreground">Loading appointments...</div>
					) : (
						<DataTable columns={columns} data={filteredAppointments} emptyMessage="No appointments found" />
					)}
				</ListCard>
			</DashboardPageShell>

			<CancelAppointmentDialog
				appointment={selectedAppointment}
				isLoading={cancelAppointment.isPending}
				onConfirm={handleCancelConfirm}
				onOpenChange={setCancelDialogOpen}
				open={cancelDialogOpen}
				userRole="patient"
			/>
		</>
	);
}

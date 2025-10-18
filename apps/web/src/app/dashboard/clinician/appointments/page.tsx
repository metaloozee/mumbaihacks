"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AppointmentForm } from "@/components/dashboard/appointment-form";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/ui/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { type RouterOutput, trpc, trpcClient } from "@/utils/trpc";

type Appointment = RouterOutput["appointments"]["list"][number];

export default function ClinicianAppointmentsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [createOpen, setCreateOpen] = useState(false);

	const { data: session } = authClient.useSession();
	const clinicianId = session?.user.id || "";

	const { data: appointments, isLoading, refetch } = useQuery(trpc.appointments.list.queryOptions());
	const { data: patients } = useQuery(trpc.patients.list.queryOptions());

	// Sort appointments by scheduled date and time (earliest first)
	const sortedAppointments = [...(appointments || [])].sort((a, b) => {
		const dateA = new Date(a.scheduledAt).getTime();
		const dateB = new Date(b.scheduledAt).getTime();
		return dateA - dateB;
	});

	const updateAppointment = useMutation({
		mutationFn: (data: { id: string; status: "confirmed" | "completed" | "cancelled" }) =>
			trpcClient.appointments.update.mutate(data),
		onSuccess: () => {
			toast.success("Appointment updated successfully!");
			refetch();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update appointment");
		},
	});

	const filteredAppointments =
		statusFilter === "all" ? sortedAppointments : sortedAppointments.filter((apt) => apt.status === statusFilter);

	const patientsList = (patients || []).map((p) => {
		if ("patient" in p && p.patient) {
			return { id: p.patient.id, name: p.patient.name };
		}
		if ("patientId" in p) {
			return { id: p.patientId, name: "Unknown" };
		}
		return { id: "", name: "Unknown" };
	});

	const cliniciansList = clinicianId ? [{ id: clinicianId, name: "Me" }] : [];

	const createAppointment = useMutation({
		mutationFn: (data: { patientId: string; clinicianId: string; scheduledAt: string; notes?: string }) =>
			trpcClient.appointments.create.mutate(data),
		onSuccess: () => {
			toast.success("Appointment created successfully!");
			setCreateOpen(false);
			refetch();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create appointment");
		},
	});

	const handleCreateSubmit = (formData: {
		patientId: string;
		clinicianId: string;
		scheduledAt: string;
		notes?: string;
	}) => {
		createAppointment.mutate({
			patientId: formData.patientId,
			clinicianId: formData.clinicianId,
			scheduledAt: formData.scheduledAt,
			notes: formData.notes,
		});
	};

	const columns: ColumnDef<Appointment>[] = [
		{
			accessorKey: "patientName",
			header: "Patient",
			cell: ({ getValue }) => {
				const patientName = getValue() as string | undefined;
				return <span className="font-medium">{patientName || "Unknown"}</span>;
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
						<Link href={`/dashboard/clinician/appointments/${row.original.id}`}>View</Link>
					</Button>
					{row.original.status === "pending" && (
						<Button
							disabled={updateAppointment.isPending}
							onClick={() => updateAppointment.mutate({ id: row.original.id, status: "confirmed" })}
							size="sm"
							variant="default"
						>
							Confirm
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<FormDialog
							maxWidthClassName="sm:max-w-2xl"
							onOpenChange={setCreateOpen}
							open={createOpen}
							trigger={
								<Button type="button">
									<Plus className="h-4 w-4" />
									New Appointment
								</Button>
							}
						>
							<AppointmentForm
								clinicians={cliniciansList}
								defaultClinicianId={clinicianId}
								onCancel={() => setCreateOpen(false)}
								onSubmit={handleCreateSubmit}
								patients={patientsList}
							/>
						</FormDialog>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Clinician", href: "/dashboard/clinician" },
						{ label: "Appointments" },
					]}
					description="Manage your patient appointments"
					icon={<Calendar className="h-8 w-8" />}
					title="Appointments"
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
	);
}

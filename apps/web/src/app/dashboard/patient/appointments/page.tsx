"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Appointment = {
	id: string;
	clinicianName: string;
	scheduledAt: string;
	status: "pending" | "confirmed" | "completed" | "cancelled";
	notes?: string;
};

export default function PatientAppointmentsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// TODO: Fetch appointments using tRPC
	const appointments: Appointment[] = [];

	const filteredAppointments =
		statusFilter === "all" ? appointments : appointments.filter((apt) => apt.status === statusFilter);

	const columns: ColumnDef<Appointment>[] = [
		{
			accessorKey: "clinicianName",
			header: "Clinician",
		},
		{
			accessorKey: "scheduledAt",
			header: "Date & Time",
			cell: ({ getValue }) => {
				const date = new Date(getValue() as string);
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
				const notes = getValue() as string | undefined;
				return <span className="text-muted-foreground text-sm">{notes || "No notes"}</span>;
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex gap-2">
					<Button disabled size="sm" variant="outline">
						View Details
					</Button>
					{row.original.status === "pending" && (
						<Button disabled size="sm" variant="destructive">
							Cancel
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
				<DataTable columns={columns} data={filteredAppointments} emptyMessage="No appointments found" />
			</ListCard>
		</DashboardPageShell>
	);
}

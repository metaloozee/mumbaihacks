"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		<div className="flex-1 space-y-6 p-8">
			<DashboardBreadcrumb
				items={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Patient", href: "/dashboard/patient" },
					{ label: "Appointments" },
				]}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="flex items-center font-bold text-3xl tracking-tight">
						<Calendar className="mr-3 h-8 w-8" />
						My Appointments
					</h1>
					<p className="mt-2 text-muted-foreground">View your scheduled appointments</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>All Appointments</CardTitle>
						<div className="flex items-center gap-4">
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
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={filteredAppointments} emptyMessage="No appointments found" />
				</CardContent>
			</Card>
		</div>
	);
}

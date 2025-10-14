"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAppointmentStatusVariant } from "@/lib/badge-variants";

type Appointment = {
	id: string;
	patientName: string;
	scheduledAt: string;
	status: string;
};

type AppointmentsTableProps = {
	appointments: Appointment[];
	emptyMessage?: string;
};

const appointmentColumns: ColumnDef<Appointment>[] = [
	{
		accessorKey: "patientName",
		header: "Patient",
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
			return <Badge variant={getAppointmentStatusVariant(status)}>{status}</Badge>;
		},
	},
	{
		id: "actions",
		cell: () => (
			<Link href={"/dashboard/clinician/appointments"}>
				<Button size="sm" variant="ghost">
					View <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</Link>
		),
	},
];

export function AppointmentsTable({
	appointments,
	emptyMessage = "No appointments scheduled",
}: AppointmentsTableProps) {
	return <DataTable columns={appointmentColumns} data={appointments} emptyMessage={emptyMessage} />;
}

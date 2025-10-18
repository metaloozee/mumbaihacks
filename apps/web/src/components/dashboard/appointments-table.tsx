"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
			return <Badge>{status}</Badge>;
		},
	},
	{
		id: "actions",
		cell: () => (
			<Link href={"/dashboard/clinician/appointments"}>
				<Button size="sm" variant="ghost">
					View <ArrowRight className="h-4 w-4" />
				</Button>
			</Link>
		),
	},
];

export function AppointmentsTable({
	appointments,
	emptyMessage = "No appointments scheduled",
}: AppointmentsTableProps) {
	// Sort appointments by scheduled date and time (earliest first)
	// Memoized to avoid re-sorting on every render
	const sortedAppointments = useMemo(() => {
		return [...appointments].sort((a, b) => {
			// Defensive date parsing - treat invalid dates as far future (Infinity)
			const dateA = new Date(a.scheduledAt).getTime();
			const timestampA = Number.isFinite(dateA) ? dateA : Number.POSITIVE_INFINITY;

			const dateB = new Date(b.scheduledAt).getTime();
			const timestampB = Number.isFinite(dateB) ? dateB : Number.POSITIVE_INFINITY;

			return timestampA - timestampB;
		});
	}, [appointments]);

	return <DataTable columns={appointmentColumns} data={sortedAppointments} emptyMessage={emptyMessage} />;
}

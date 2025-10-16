"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";

type MedicalRecord = {
	id: string;
	clinicianName: string;
	diagnosis: string;
	notes?: string;
	createdAt: string;
};

export default function PatientRecordsPage() {
	// TODO: Fetch medical records using tRPC
	const records: MedicalRecord[] = [];

	const columns: ColumnDef<MedicalRecord>[] = [
		{
			accessorKey: "createdAt",
			header: "Date",
			cell: ({ getValue }) => {
				const date = new Date(getValue() as string);
				return date.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			},
		},
		{
			accessorKey: "clinicianName",
			header: "Clinician",
		},
		{
			accessorKey: "diagnosis",
			header: "Diagnosis",
		},
		{
			accessorKey: "notes",
			header: "Notes",
			cell: ({ getValue }) => {
				const notes = getValue() as string | undefined;
				return (
					<span className="block max-w-xs truncate text-muted-foreground text-sm">{notes || "No notes"}</span>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: () => (
				<Button disabled size="sm" variant="outline">
					View Details
				</Button>
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
						{ label: "Medical Records" },
					]}
					description="View your medical history and records"
					icon={<FileText className="h-8 w-8" />}
					title="Medical Records"
				/>
			}
		>
			<ListCard title="All Medical Records">
				<DataTable columns={columns} data={records} emptyMessage="No medical records found" />
			</ListCard>
		</DashboardPageShell>
	);
}

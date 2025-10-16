"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Plus } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";

type MedicalRecord = {
	id: string;
	patientId: string;
	patientName: string;
	diagnosis: string;
	notes?: string;
	createdAt: string;
};

export default function ClinicianRecordsPage() {
	// TODO: Fetch medical records using tRPC
	const records: MedicalRecord[] = [];

	const columns: ColumnDef<MedicalRecord>[] = [
		{
			accessorKey: "patientName",
			header: "Patient",
		},
		{
			accessorKey: "diagnosis",
			header: "Diagnosis",
		},
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
				<div className="flex gap-2">
					<Button disabled size="sm" variant="outline">
						View
					</Button>
					<Button disabled size="sm" variant="outline">
						Edit
					</Button>
				</div>
			),
		},
	];

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Button disabled>
							<Plus className="mr-2 h-4 w-4" />
							New Record
						</Button>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Clinician", href: "/dashboard/clinician" },
						{ label: "Medical Records" },
					]}
					description="Access and manage patient medical records"
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

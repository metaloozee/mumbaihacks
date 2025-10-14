"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Plus } from "lucide-react";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
		<div className="flex-1 space-y-6 p-8">
			<DashboardBreadcrumb
				items={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Clinician", href: "/dashboard/clinician" },
					{ label: "Medical Records" },
				]}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="flex items-center font-bold text-3xl tracking-tight">
						<FileText className="mr-3 h-8 w-8" />
						Medical Records
					</h1>
					<p className="mt-2 text-muted-foreground">Access and manage patient medical records</p>
				</div>
				<Button disabled>
					<Plus className="mr-2 h-4 w-4" />
					New Record
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Medical Records</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={records} emptyMessage="No medical records found" />
				</CardContent>
			</Card>
		</div>
	);
}

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
		<div className="flex-1 space-y-6 p-8">
			<DashboardBreadcrumb
				items={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Patient", href: "/dashboard/patient" },
					{ label: "Medical Records" },
				]}
			/>

			<div>
				<h1 className="flex items-center font-bold text-3xl tracking-tight">
					<FileText className="mr-3 h-8 w-8" />
					Medical Records
				</h1>
				<p className="mt-2 text-muted-foreground">View your medical history and records</p>
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

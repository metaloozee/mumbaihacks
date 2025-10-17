"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { type RouterOutput, trpc } from "@/utils/trpc";

type MedicalRecord = RouterOutput["medicalRecords"]["list"][number];

export default function ClinicianRecordsPage() {
	const { data: records, isLoading } = useQuery(trpc.medicalRecords.list.queryOptions());

	const columns: ColumnDef<MedicalRecord>[] = [
		{
			accessorKey: "patientId",
			header: "Patient",
			cell: ({ getValue }) => {
				const patientId = getValue() as string;
				const PATIENT_ID_PREVIEW_LENGTH = 8;
				return <span className="font-mono text-sm">{patientId.slice(0, PATIENT_ID_PREVIEW_LENGTH)}...</span>;
			},
		},
		{
			accessorKey: "diagnosis",
			header: "Diagnosis",
		},
		{
			accessorKey: "createdAt",
			header: "Date",
			cell: ({ getValue }) => {
				const dateValue = getValue() as Date | string;
				const date = new Date(dateValue);
				if (Number.isNaN(date.getTime())) {
					return "Invalid date";
				}
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
				const notes = getValue() as string | null | undefined;
				return (
					<span className="block max-w-xs truncate text-muted-foreground text-sm">{notes || "No notes"}</span>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex gap-2">
					<Button asChild size="sm" variant="outline">
						{/* @ts-ignore */}
						<Link href={`/dashboard/clinician/records/${row.original.id}`}>View</Link>
					</Button>
					<Button asChild size="sm" variant="outline">
						{/* @ts-ignore */}
						<Link href={`/dashboard/clinician/records/${row.original.id}/edit`}>Edit</Link>
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
						<Button asChild>
							<Link href="/dashboard/clinician/records/new">
								<Plus className="h-4 w-4" />
								New Record
							</Link>
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
				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground">Loading medical records...</div>
				) : (
					<DataTable columns={columns} data={records || []} emptyMessage="No medical records found" />
				)}
			</ListCard>
		</DashboardPageShell>
	);
}

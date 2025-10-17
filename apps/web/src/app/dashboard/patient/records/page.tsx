"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { type RouterOutput, trpc } from "@/utils/trpc";

type MedicalRecord = RouterOutput["medicalRecords"]["list"][number];

export default function PatientRecordsPage() {
	const { data: records, isLoading } = useQuery(trpc.medicalRecords.list.queryOptions());

	const columns: ColumnDef<MedicalRecord>[] = [
		{
			accessorKey: "createdAt",
			header: "Date",
			cell: ({ getValue }) => {
				const date = getValue() as Date;
				return new Date(date).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			},
		},
		{
			accessorKey: "clinicianName",
			header: "Clinician",
			cell: ({ getValue }) => {
				const clinicianName = getValue() as string | undefined;
				return <span className="font-medium">Dr. {clinicianName || "Unknown"}</span>;
			},
		},
		{
			accessorKey: "diagnosis",
			header: "Diagnosis",
			cell: ({ getValue }) => {
				const diagnosis = getValue() as string;
				return <span className="font-medium">{diagnosis}</span>;
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
				<Button asChild size="sm" variant="outline">
					<Link href={`/dashboard/patient/records/${row.original.id}`}>View</Link>
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
				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground">Loading medical records...</div>
				) : (
					<DataTable columns={columns} data={records ?? []} emptyMessage="No medical records found" />
				)}
			</ListCard>
		</DashboardPageShell>
	);
}

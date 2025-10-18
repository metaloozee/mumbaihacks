"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { MedicalRecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/ui/form-dialog";
import { type RouterOutput, trpc, trpcClient } from "@/utils/trpc";

type MedicalRecord = RouterOutput["medicalRecords"]["list"][number];

export default function ClinicianRecordsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const { data: records, isLoading, refetch } = useQuery(trpc.medicalRecords.list.queryOptions());
	const { data: patients } = useQuery(trpc.patients.list.queryOptions());

	const createRecord = useMutation({
		mutationFn: (data: { patientId: string; diagnosis: string; notes?: string }) =>
			trpcClient.medicalRecords.create.mutate(data),
		onSuccess: () => {
			setCreateOpen(false);
			refetch();
		},
	});

	const patientsList = (patients || []).map((p) => {
		if ("patient" in p && p.patient) {
			return { id: p.patient.id, name: p.patient.name };
		}
		if ("patientId" in p) {
			return { id: p.patientId, name: "Unknown" };
		}
		return { id: "", name: "Unknown" };
	});

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
						<FormDialog
							maxWidthClassName="sm:max-w-xl"
							onOpenChange={setCreateOpen}
							open={createOpen}
							trigger={
								<Button type="button">
									<Plus className="h-4 w-4" />
									New Record
								</Button>
							}
						>
							<MedicalRecordForm
								onCancel={() => setCreateOpen(false)}
								onSubmit={(data) => createRecord.mutate(data)}
								patients={patientsList}
							/>
						</FormDialog>
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

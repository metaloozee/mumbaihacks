"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { PrescriptionForm } from "@/components/dashboard/prescription-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/ui/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type RouterOutput, trpc, trpcClient } from "@/utils/trpc";

type Prescription = RouterOutput["prescriptions"]["list"][number];

export default function ClinicianPrescriptionsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [createOpen, setCreateOpen] = useState(false);

	const { data: prescriptions, isLoading, refetch } = useQuery(trpc.prescriptions.list.queryOptions());
	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	const createPrescription = useMutation({
		mutationFn: async (data: Parameters<typeof trpcClient.prescriptions.create.mutate>[0]) =>
			await trpcClient.prescriptions.create.mutate(data),
		onSuccess: () => {
			toast.success("Prescription created successfully!");
			setCreateOpen(false);
			refetch();
		},
		onError: (error: Error) => toast.error(error.message || "Failed to create prescription"),
	});

	const filteredPrescriptions =
		statusFilter === "all"
			? prescriptions || []
			: (prescriptions || []).filter((presc) => presc.status === statusFilter);

	const appointmentOptions =
		appointments?.map((a) => ({
			id: a.id,
			patientName: a.patientName,
			date: new Date(a.scheduledAt).toLocaleDateString(),
		})) || [];

	const columns: ColumnDef<Prescription>[] = [
		{
			accessorKey: "appointmentId",
			header: "Appointment",
			cell: ({ getValue }) => {
				const appointmentId = getValue() as string;
				const APPOINTMENT_ID_PREVIEW_LENGTH = 8;
				return (
					<span className="font-mono text-sm">
						{appointmentId.slice(0, APPOINTMENT_ID_PREVIEW_LENGTH)}...
					</span>
				);
			},
		},
		{
			accessorKey: "medication",
			header: "Medication",
		},
		{
			accessorKey: "dosage",
			header: "Dosage",
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
			accessorKey: "expiryDate",
			header: "Expires",
			cell: ({ getValue }) => {
				const dateStr = getValue() as string;
				const date = new Date(dateStr);
				if (Number.isNaN(date.getTime())) {
					return "N/A";
				}
				return date.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				});
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex gap-2">
					<Button asChild size="sm" variant="outline">
						{/* @ts-ignore */}
						<Link href={`/dashboard/clinician/prescriptions/${row.original.id}`}>View</Link>
					</Button>
					<FormDialog
						maxWidthClassName="sm:max-w-2xl"
						trigger={
							<Button size="sm" type="button" variant="outline">
								Renew
							</Button>
						}
					>
						<PrescriptionForm
							appointments={appointmentOptions}
							onCancel={undefined}
							onSubmit={(data) => createPrescription.mutate(data)}
						/>
					</FormDialog>
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
							maxWidthClassName="sm:max-w-2xl"
							onOpenChange={setCreateOpen}
							open={createOpen}
							trigger={
								<Button type="button">
									<Plus className="h-4 w-4" />
									New Prescription
								</Button>
							}
						>
							<PrescriptionForm
								appointments={appointmentOptions}
								onCancel={() => setCreateOpen(false)}
								onSubmit={(data) => createPrescription.mutate(data)}
							/>
						</FormDialog>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Clinician", href: "/dashboard/clinician" },
						{ label: "Prescriptions" },
					]}
					description="Manage patient prescriptions and medications"
					icon={<FileText className="h-8 w-8" />}
					title="Prescriptions"
				/>
			}
		>
			<ListCard
				actions={
					<Select onValueChange={setStatusFilter} value={statusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="filled">Filled</SelectItem>
							<SelectItem value="expired">Expired</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				}
				title="All Prescriptions"
			>
				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground">Loading prescriptions...</div>
				) : (
					<DataTable
						columns={columns}
						data={filteredPrescriptions ?? []}
						emptyMessage="No prescriptions found"
					/>
				)}
			</ListCard>
		</DashboardPageShell>
	);
}

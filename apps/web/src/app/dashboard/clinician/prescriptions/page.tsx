"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Prescription = {
	id: string;
	patientName: string;
	medication: string;
	dosage: string;
	status: "active" | "expired" | "filled" | "cancelled";
	expiryDate: string;
};

export default function ClinicianPrescriptionsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// TODO: Fetch prescriptions using tRPC
	const prescriptions: Prescription[] = [];

	const filteredPrescriptions =
		statusFilter === "all" ? prescriptions : prescriptions.filter((presc) => presc.status === statusFilter);

	const columns: ColumnDef<Prescription>[] = [
		{
			accessorKey: "patientName",
			header: "Patient",
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
				const date = new Date(getValue() as string);
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
			cell: () => (
				<div className="flex gap-2">
					<Button disabled size="sm" variant="outline">
						View
					</Button>
					<Button disabled size="sm" variant="outline">
						Renew
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
							New Prescription
						</Button>
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
				<DataTable columns={columns} data={filteredPrescriptions} emptyMessage="No prescriptions found" />
			</ListCard>
		</DashboardPageShell>
	);
}

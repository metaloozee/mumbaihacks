"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pill } from "lucide-react";
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
	medication: string;
	dosage: string;
	duration: string;
	status: "active" | "expired" | "filled" | "cancelled";
	expiryDate: string;
	instructions?: string;
};

export default function PatientPrescriptionsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// TODO: Fetch prescriptions using tRPC
	const prescriptions: Prescription[] = [];

	const filteredPrescriptions =
		statusFilter === "all" ? prescriptions : prescriptions.filter((presc) => presc.status === statusFilter);

	const columns: ColumnDef<Prescription>[] = [
		{
			accessorKey: "medication",
			header: "Medication",
		},
		{
			accessorKey: "dosage",
			header: "Dosage",
		},
		{
			accessorKey: "duration",
			header: "Duration",
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
			accessorKey: "instructions",
			header: "Instructions",
			cell: ({ getValue }) => {
				const instructions = getValue() as string | undefined;
				return (
					<span className="block max-w-xs truncate text-muted-foreground text-sm">
						{instructions || "No instructions"}
					</span>
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
						{ label: "Prescriptions" },
					]}
					description="View your prescription history and active medications"
					icon={<Pill className="h-8 w-8" />}
					title="My Prescriptions"
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

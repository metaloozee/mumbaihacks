"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pill } from "lucide-react";
import { useState } from "react";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPrescriptionStatusVariant } from "@/lib/badge-variants";

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
				return (
					<Badge variant={getPrescriptionStatusVariant(status)}>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</Badge>
				);
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
		<div className="flex-1 space-y-6 p-8">
			<DashboardBreadcrumb
				items={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Patient", href: "/dashboard/patient" },
					{ label: "Prescriptions" },
				]}
			/>

			<div>
				<h1 className="flex items-center font-bold text-3xl tracking-tight">
					<Pill className="mr-3 h-8 w-8" />
					My Prescriptions
				</h1>
				<p className="mt-2 text-muted-foreground">View your prescription history and active medications</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>All Prescriptions</CardTitle>
						<div className="flex items-center gap-4">
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
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={filteredPrescriptions} emptyMessage="No prescriptions found" />
				</CardContent>
			</Card>
		</div>
	);
}

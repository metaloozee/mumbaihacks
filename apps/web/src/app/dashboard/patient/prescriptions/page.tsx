"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Pill } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc, trpcClient } from "@/utils/trpc";

type Prescription = {
	id: string;
	medication: string;
	dosage: string;
	duration: string;
	status: "active" | "expired" | "filled" | "cancelled";
	expiryDate: string;
	instructions?: string | null;
	refills: number;
};

export default function PatientPrescriptionsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [refillDialogOpen, setRefillDialogOpen] = useState(false);
	const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

	const { data: prescriptions, isLoading, refetch } = useQuery(trpc.prescriptions.list.queryOptions());

	const requestRefill = useMutation({
		mutationFn: (id: string) => trpcClient.prescriptions.requestRefill.mutate({ id }),
		onSuccess: () => {
			toast.success("Refill requested successfully!");
			setRefillDialogOpen(false);
			refetch();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to request refill");
		},
	});

	const filteredPrescriptions =
		statusFilter === "all"
			? prescriptions || []
			: (prescriptions || []).filter((presc) => presc.status === statusFilter);

	const handleRefillClick = (prescription: Prescription) => {
		setSelectedPrescription(prescription);
		setRefillDialogOpen(true);
	};

	const handleRefillConfirm = () => {
		if (selectedPrescription) {
			requestRefill.mutate(selectedPrescription.id);
		}
	};

	const columns: ColumnDef<Prescription>[] = [
		{
			accessorKey: "medication",
			header: "Medication",
			cell: ({ getValue }) => {
				const medication = getValue() as string;
				return <span className="font-medium">{medication}</span>;
			},
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
			accessorKey: "refills",
			header: "Refills",
			cell: ({ getValue }) => {
				const refills = getValue() as number;
				return <span className="text-sm">{refills}</span>;
			},
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
					return <span className="text-destructive">Invalid date</span>;
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
						<Link href={`/dashboard/patient/prescriptions/${row.original.id}`}>View</Link>
					</Button>
					{row.original.status === "active" && (
						<Button onClick={() => handleRefillClick(row.original)} size="sm" variant="default">
							Request Refill
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<>
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
					{isLoading ? (
						<div className="py-8 text-center text-muted-foreground">Loading prescriptions...</div>
					) : (
						<DataTable
							columns={columns}
							data={filteredPrescriptions}
							emptyMessage="No prescriptions found"
						/>
					)}
				</ListCard>
			</DashboardPageShell>

			<Dialog onOpenChange={setRefillDialogOpen} open={refillDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Request Prescription Refill</DialogTitle>
						<DialogDescription>
							You are about to request a refill for this prescription. The clinician will be notified and
							will process your request.
						</DialogDescription>
					</DialogHeader>

					{selectedPrescription && (
						<div className="space-y-2 rounded-md border bg-muted/50 p-4">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Medication:</span>
								<span className="font-medium">{selectedPrescription.medication}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Dosage:</span>
								<span className="font-medium">{selectedPrescription.dosage}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Current Refills:</span>
								<span className="font-medium">{selectedPrescription.refills}</span>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button onClick={() => setRefillDialogOpen(false)} type="button" variant="outline">
							Cancel
						</Button>
						<Button disabled={requestRefill.isPending} onClick={handleRefillConfirm} type="button">
							{requestRefill.isPending ? "Requesting..." : "Confirm Request"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

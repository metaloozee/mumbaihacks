"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { FlaskConical, Plus } from "lucide-react";
// import Link from "next/link"; // Not used when using dialog trigger
import { useState } from "react";
import { toast } from "sonner";
import { OrderForm } from "@/components/dashboard/order-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog } from "@/components/ui/form-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc, trpcClient } from "@/utils/trpc";

function getOrderStatusVariant(status: string) {
	if (status === "completed") {
		return "default";
	}
	if (status === "in-progress") {
		return "secondary";
	}
	if (status === "cancelled") {
		return "destructive";
	}
	return "outline";
}

export default function OrdersPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const { data: orders, isLoading, refetch } = useQuery(trpc.orders.list.queryOptions());
	const { data: patients } = useQuery(trpc.patients.list.queryOptions());
	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	const createOrder = useMutation({
		mutationFn: (data: {
			patientId: string;
			appointmentId?: string;
			orderType: "lab" | "imaging";
			orderDetails: string;
			priority: "routine" | "urgent" | "stat";
		}) => trpcClient.orders.create.mutate(data),
		onSuccess: () => {
			setCreateOpen(false);
			refetch();
		},
		onError: (error) => {
			toast.error("Failed to create order:", { description: error.message });
		},
	});

	const isClinicianPatientRelation = (
		p: unknown
	): p is { id: string; patientId: string; patient: { id: string; name: string | null } } =>
		typeof p === "object" &&
		p !== null &&
		"patient" in p &&
		typeof p.patient === "object" &&
		p.patient !== null &&
		"id" in p.patient &&
		"name" in p.patient &&
		typeof p.patient.id === "string" &&
		p.patient.id.length > 0;

	const patientsList: Array<{ id: string; name: string }> = (patients ?? []).flatMap((p) => {
		if (isClinicianPatientRelation(p)) {
			return [{ id: p.patient.id, name: p.patient.name ?? "Unknown" }];
		}
		return [];
	});

	const appointmentsList = (appointments || []).map((a) => ({
		id: a.id,
		patientName: (a as { patientName?: string } | undefined)?.patientName ?? "Unknown",
		date: new Date(a.scheduledAt).toLocaleString(),
	}));

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
									New Order
								</Button>
							}
						>
							<OrderForm
								appointments={appointmentsList}
								onCancel={() => setCreateOpen(false)}
								onSubmit={(data) => {
									if (!data.orderType) {
										return; // guarded already by form
									}
									createOrder.mutate({
										patientId: data.patientId,
										appointmentId: data.appointmentId,
										orderType: data.orderType,
										orderDetails: data.orderDetails,
										priority: data.priority,
									});
								}}
								patients={patientsList}
							/>
						</FormDialog>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Clinician", href: "/dashboard/clinician" },
						{ label: "Medical Orders" },
					]}
					description="View and manage medical orders"
					icon={<FlaskConical className="h-8 w-8" />}
					title="Medical Orders"
				/>
			}
		>
			<Card>
				<CardHeader>
					<CardTitle>Recent Orders</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && <div className="text-center text-muted-foreground">Loading...</div>}
					{!isLoading && orders && orders.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Details</TableHead>
									<TableHead>Priority</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
										<TableCell className="capitalize">{order.orderType}</TableCell>
										<TableCell>{order.orderDetails}</TableCell>
										<TableCell className="capitalize">{order.priority}</TableCell>
										<TableCell>
											<Badge variant={getOrderStatusVariant(order.status)}>{order.status}</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
					{!isLoading && (!orders || orders.length === 0) && (
						<div className="text-center text-muted-foreground">No orders found</div>
					)}
				</CardContent>
			</Card>
		</DashboardPageShell>
	);
}

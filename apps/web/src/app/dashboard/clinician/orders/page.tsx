"use client";

import { useQuery } from "@tanstack/react-query";
import { FlaskConical, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

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
	const { data: orders, isLoading } = useQuery(trpc.orders.list.queryOptions());

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Button asChild>
							<Link href="/dashboard/clinician/orders/new">
								<Plus className="h-4 w-4" />
								New Order
							</Link>
						</Button>
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

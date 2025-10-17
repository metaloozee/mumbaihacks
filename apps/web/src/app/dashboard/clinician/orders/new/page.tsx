"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrderForm } from "@/components/dashboard/order-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { trpc, trpcClient } from "@/utils/trpc";

export default function NewOrderPage() {
	const router = useRouter();

	const { data: patients } = useQuery(trpc.patients.list.queryOptions());
	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	const createOrder = useMutation({
		mutationFn: (data: Parameters<typeof trpcClient.orders.create.mutate>[0]) =>
			trpcClient.orders.create.mutate(data),
		onSuccess: () => {
			toast.success("Order created successfully!");
			router.push("/dashboard/clinician/orders");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create order");
		},
	});

	const handleSubmit = (formData: {
		patientId: string;
		appointmentId?: string;
		orderType: "lab" | "imaging" | "";
		orderDetails: string;
		priority: "routine" | "urgent" | "stat";
	}) => {
		if (!formData.orderType) {
			return;
		}
		createOrder.mutate({
			...formData,
			orderType: formData.orderType as "lab" | "imaging",
		});
	};

	const patientsList = (patients || []).map((p) => {
		if ("patient" in p && p.patient) {
			return { id: p.patient.id, name: p.patient.name };
		}
		if ("patientId" in p) {
			return { id: p.patientId, name: "Unknown" };
		}
		return { id: "", name: "Unknown" };
	});

	const appointmentsList =
		appointments?.map((a) => ({
			id: a.id,
			patientName: "Patient",
			date: new Date(a.scheduledAt).toLocaleDateString(),
		})) || [];

	return (
		<DashboardPageShell>
			<PageHeader
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/clinician/orders">
							<ArrowLeft className="h-4 w-4" />
							Back to Orders
						</Link>
					</Button>
				}
				description="Order lab tests or imaging studies for patients"
				title="Create Medical Order"
			/>

			<div className="mx-auto max-w-4xl">
				<OrderForm
					appointments={appointmentsList}
					onCancel={() => router.back()}
					onSubmit={handleSubmit}
					patients={patientsList}
				/>
			</div>
		</DashboardPageShell>
	);
}

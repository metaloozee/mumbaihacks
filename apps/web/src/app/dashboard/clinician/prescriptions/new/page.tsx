"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { PrescriptionForm } from "@/components/dashboard/prescription-form";
import { Button } from "@/components/ui/button";
import { trpc, trpcClient } from "@/utils/trpc";

export default function NewPrescriptionPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const preselectedAppointmentId = searchParams.get("appointmentId");

	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	const createPrescription = useMutation({
		mutationFn: (data: {
			appointmentId: string;
			medication: string;
			dosage: string;
			duration: string;
			refills: number;
			expiryDate: string;
			instructions?: string;
		}) => trpcClient.prescriptions.create.mutate(data),
		onSuccess: () => {
			toast.success("Prescription created successfully!");
			router.push("/dashboard/clinician/prescriptions");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create prescription");
		},
	});

	const handleSubmit = (formData: {
		appointmentId: string;
		medication: string;
		dosage: string;
		duration: string;
		refills: number;
		expiryDate: string;
		instructions?: string;
	}) => {
		createPrescription.mutate(formData);
	};

	const appointmentsList =
		appointments?.map((a) => ({
			id: a.id,
			patientName: a.patientId,
			date: new Date(a.scheduledAt).toLocaleDateString(),
		})) || [];

	return (
		<DashboardPageShell>
			<PageHeader
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/clinician/prescriptions">
							<ArrowLeft className="h-4 w-4" />
							Back to Prescriptions
						</Link>
					</Button>
				}
				breadcrumbItems={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Clinician", href: "/dashboard/clinician" },
					{ label: "Prescriptions", href: "/dashboard/clinician/prescriptions" },
					{ label: "New Prescription" },
				]}
				description="Create a new prescription for a patient"
				icon={<FileText className="h-8 w-8" />}
				title="Create Prescription"
			/>

			<div className="mx-auto max-w-2xl">
				<PrescriptionForm
					appointments={appointmentsList}
					defaultAppointmentId={preselectedAppointmentId || undefined}
					onCancel={() => router.back()}
					onSubmit={handleSubmit}
				/>
			</div>
		</DashboardPageShell>
	);
}

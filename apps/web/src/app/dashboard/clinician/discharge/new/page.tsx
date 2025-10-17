"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DischargeForm } from "@/components/dashboard/discharge-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { trpc, trpcClient } from "@/utils/trpc";

export default function NewDischargePage() {
	const router = useRouter();

	const { data: patients } = useQuery(trpc.patients.list.queryOptions());
	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	const createDischarge = useMutation({
		mutationFn: (data: Parameters<typeof trpcClient.discharge.create.mutate>[0]) =>
			trpcClient.discharge.create.mutate(data),
		onSuccess: () => {
			toast.success("Discharge summary created successfully!");
			router.push("/dashboard/clinician/discharge");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create discharge summary");
		},
	});

	const handleSubmit = (formData: {
		patientId: string;
		appointmentId?: string;
		dischargeDate: string;
		dischargeDiagnosis: string;
		treatmentProvided: string;
		followUpInstructions?: string;
		medications?: string;
		restrictions?: string;
	}) => {
		createDischarge.mutate(formData);
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
						<Link href="/dashboard/clinician/discharge">
							<ArrowLeft className="h-4 w-4" />
							Back to Discharge
						</Link>
					</Button>
				}
				description="Document patient discharge with diagnosis, treatment, and follow-up instructions"
				title="Create Discharge Summary"
			/>

			<div className="mx-auto max-w-4xl">
				<DischargeForm
					appointments={appointmentsList}
					onCancel={() => router.back()}
					onSubmit={handleSubmit}
					patients={patientsList}
				/>
			</div>
		</DashboardPageShell>
	);
}

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { MedicalRecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { trpc, trpcClient } from "@/utils/trpc";

export default function NewMedicalRecordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const preselectedPatientId = searchParams.get("patientId");

	const { data: patients } = useQuery(trpc.patients.list.queryOptions());

	const createRecord = useMutation({
		mutationFn: (data: { patientId: string; diagnosis: string; notes?: string }) =>
			trpcClient.medicalRecords.create.mutate(data),
		onSuccess: () => {
			toast.success("Medical record created successfully!");
			router.push("/dashboard/clinician/records");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create medical record");
		},
	});

	const handleSubmit = (formData: { patientId: string; diagnosis: string; notes?: string }) => {
		createRecord.mutate(formData);
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

	return (
		<DashboardPageShell>
			<PageHeader
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/clinician/records">
							<ArrowLeft className="h-4 w-4" />
							Back to Records
						</Link>
					</Button>
				}
				breadcrumbItems={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Clinician", href: "/dashboard/clinician" },
					{ label: "Medical Records", href: "/dashboard/clinician/records" },
					{ label: "New Record" },
				]}
				description="Create a new medical record for a patient"
				icon={<FileText className="h-8 w-8" />}
				title="Create Medical Record"
			/>

			<div className="mx-auto max-w-2xl">
				<MedicalRecordForm
					defaultPatientId={preselectedPatientId || undefined}
					onCancel={() => router.back()}
					onSubmit={handleSubmit}
					patients={patientsList}
				/>
			</div>
		</DashboardPageShell>
	);
}

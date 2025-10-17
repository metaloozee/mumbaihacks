"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AssessmentForm } from "@/components/dashboard/assessment-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { trpc, trpcClient } from "@/utils/trpc";

export default function NewAssessmentPage() {
	const router = useRouter();

	const { data: patients } = useQuery(trpc.patients.list.queryOptions());
	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	const createAssessment = useMutation({
		mutationFn: (data: Parameters<typeof trpcClient.assessments.create.mutate>[0]) =>
			trpcClient.assessments.create.mutate(data),
		onSuccess: () => {
			toast.success("Assessment created successfully!");
			router.push("/dashboard/clinician/assessments");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create assessment");
		},
	});

	const handleSubmit = (formData: {
		patientId: string;
		appointmentId?: string;
		chiefComplaint: string;
		vitalSigns?: {
			bloodPressure?: string;
			heartRate?: number;
			temperature?: number;
			respiratoryRate?: number;
			oxygenSaturation?: number;
			weight?: number;
			height?: number;
		};
		assessmentNotes?: string;
	}) => {
		createAssessment.mutate({
			patientId: formData.patientId,
			appointmentId: formData.appointmentId || undefined,
			chiefComplaint: formData.chiefComplaint,
			vitalSigns: formData.vitalSigns,
			assessmentNotes: formData.assessmentNotes,
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
						<Link href="/dashboard/clinician/assessments">
							<ArrowLeft className="h-4 w-4" />
							Back to Assessments
						</Link>
					</Button>
				}
				description="Record patient's initial assessment with vital signs and chief complaint"
				title="Create Initial Assessment"
			/>

			<div className="mx-auto max-w-4xl">
				<AssessmentForm
					appointments={appointmentsList}
					onCancel={() => router.back()}
					onSubmit={handleSubmit}
					patients={patientsList}
				/>
			</div>
		</DashboardPageShell>
	);
}

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AppointmentForm } from "@/components/dashboard/appointment-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { trpc, trpcClient } from "@/utils/trpc";

export default function NewAppointmentPage() {
	const { data: session } = authClient.useSession();
	const clinicianId = session?.user.id || "";

	const router = useRouter();
	const searchParams = useSearchParams();
	const preselectedPatientId = searchParams.get("patientId");

	const { data: patients } = useQuery(trpc.patients.list.queryOptions());

	const createAppointment = useMutation({
		mutationFn: (data: { patientId: string; clinicianId: string; scheduledAt: string; notes?: string }) =>
			trpcClient.appointments.create.mutate(data),
		onSuccess: () => {
			toast.success("Appointment created successfully!");
			router.push("/dashboard/clinician/appointments");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create appointment");
		},
	});

	const handleSubmit = (formData: {
		patientId: string;
		clinicianId: string;
		scheduledAt: string;
		notes?: string;
	}) => {
		createAppointment.mutate({
			patientId: formData.patientId,
			clinicianId: formData.clinicianId,
			scheduledAt: formData.scheduledAt,
			notes: formData.notes,
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

	const cliniciansList = clinicianId ? [{ id: clinicianId, name: "Me" }] : [];

	return (
		<DashboardPageShell>
			<PageHeader
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/clinician/appointments">
							<ArrowLeft className="h-4 w-4" />
							Back to Appointments
						</Link>
					</Button>
				}
				breadcrumbItems={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Clinician", href: "/dashboard/clinician" },
					{ label: "Appointments", href: "/dashboard/clinician/appointments" },
					{ label: "New Appointment" },
				]}
				description="Schedule a new appointment with a patient"
				icon={<Calendar className="h-8 w-8" />}
				title="Create Appointment"
			/>

			<div className="mx-auto max-w-2xl">
				<AppointmentForm
					clinicians={cliniciansList}
					defaultClinicianId={clinicianId}
					defaultPatientId={preselectedPatientId || undefined}
					onCancel={() => router.back()}
					onSubmit={handleSubmit}
					patients={patientsList}
				/>
			</div>
		</DashboardPageShell>
	);
}

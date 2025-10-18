"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Activity, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AssessmentForm } from "@/components/dashboard/assessment-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog } from "@/components/ui/form-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc, trpcClient } from "@/utils/trpc";

export default function AssessmentsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const { data: assessments, isLoading, refetch } = useQuery(trpc.assessments.list.queryOptions());
	const {
		data: patients,
		isLoading: patientsLoading,
		error: patientsError,
	} = useQuery(trpc.patients.getAvailablePatients.queryOptions());
	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	const createAssessment = useMutation({
		mutationFn: (data: Parameters<typeof trpcClient.assessments.create.mutate>[0]) =>
			trpcClient.assessments.create.mutate(data),
		onSuccess: () => {
			toast.success("Assessment created successfully!");
			setCreateOpen(false);
			refetch();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create assessment");
		},
	});

	// Filter out any patients without valid id or name
	const patientsList =
		patients
			?.filter((p) => p.id && p.name)
			.map((p) => ({
				id: p.id,
				name: p.name,
			})) || [];

	const appointmentsList =
		appointments?.map((a) => ({
			id: a.id,
			patientName: "Patient",
			date: new Date(a.scheduledAt).toLocaleDateString(),
		})) || [];

	const renderFormContent = () => {
		if (patientsLoading) {
			return (
				<div className="flex items-center justify-center p-8">
					<div className="text-muted-foreground">Loading patients...</div>
				</div>
			);
		}

		if (patientsError) {
			return (
				<div className="flex items-center justify-center p-8">
					<div className="text-destructive">Error loading patients: {patientsError.message}</div>
				</div>
			);
		}

		return (
			<AssessmentForm
				appointments={appointmentsList}
				onCancel={() => setCreateOpen(false)}
				onSubmit={(formData) =>
					createAssessment.mutate({
						patientId: formData.patientId,
						appointmentId: formData.appointmentId,
						chiefComplaint: formData.chiefComplaint,
						vitalSigns: formData.vitalSigns,
						assessmentNotes: formData.assessmentNotes,
					})
				}
				patients={patientsList}
			/>
		);
	};

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<FormDialog
							maxWidthClassName="sm:max-w-3xl"
							onOpenChange={setCreateOpen}
							open={createOpen}
							trigger={
								<Button type="button">
									<Plus className="h-4 w-4" />
									New Assessment
								</Button>
							}
						>
							{renderFormContent()}
						</FormDialog>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Clinician", href: "/dashboard/clinician" },
						{ label: "Assessments" },
					]}
					description="View and manage patient assessments"
					icon={<Activity className="h-8 w-8" />}
					title="Assessments"
				/>
			}
		>
			<Card>
				<CardHeader>
					<CardTitle>Recent Assessments</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && <div className="text-center text-muted-foreground">Loading...</div>}
					{!isLoading && assessments && assessments.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Chief Complaint</TableHead>
									<TableHead>Patient ID</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{assessments.map((assessment) => (
									<TableRow key={assessment.id}>
										<TableCell>{new Date(assessment.createdAt).toLocaleDateString()}</TableCell>
										<TableCell>{assessment.chiefComplaint}</TableCell>
										<TableCell className="font-mono text-sm">{assessment.patientId}</TableCell>
										<TableCell>
											<span className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs">
												Completed
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
					{!isLoading && (!assessments || assessments.length === 0) && (
						<div className="text-center text-muted-foreground">No assessments found</div>
					)}
				</CardContent>
			</Card>
		</DashboardPageShell>
	);
}

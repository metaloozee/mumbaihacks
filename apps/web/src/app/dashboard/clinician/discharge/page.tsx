"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DischargeForm } from "@/components/dashboard/discharge-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog } from "@/components/ui/form-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc, trpcClient } from "@/utils/trpc";

export default function DischargePage() {
	const [createOpen, setCreateOpen] = useState(false);
	const { data: discharges, isLoading, refetch } = useQuery(trpc.discharge.list.queryOptions());
	const { data: patients } = useQuery(trpc.patients.list.queryOptions());
	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	const createDischarge = useMutation({
		mutationFn: (data: Parameters<typeof trpcClient.discharge.create.mutate>[0]) =>
			trpcClient.discharge.create.mutate(data),
		onSuccess: () => {
			toast.success("Discharge summary created");
			setCreateOpen(false);
			refetch();
		},
		onError: (error: Error) => toast.error(error.message || "Failed to create discharge"),
	});

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
			date: new Date(a.scheduledAt).toLocaleString(),
		})) || [];

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
									New Discharge Summary
								</Button>
							}
						>
							<DischargeForm
								appointments={appointmentsList}
								onCancel={() => setCreateOpen(false)}
								onSubmit={(data) => createDischarge.mutate(data)}
								patients={patientsList}
							/>
						</FormDialog>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Clinician", href: "/dashboard/clinician" },
						{ label: "Discharge Summaries" },
					]}
					description="View and manage discharge summaries"
					icon={<UserRoundCheck className="h-8 w-8" />}
					title="Discharge Summaries"
				/>
			}
		>
			<Card>
				<CardHeader>
					<CardTitle>Recent Discharge Summaries</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && <div className="text-center text-muted-foreground">Loading...</div>}
					{!isLoading && discharges && discharges.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Discharge Date</TableHead>
									<TableHead>Diagnosis</TableHead>
									<TableHead>Patient ID</TableHead>
									<TableHead>Treatment</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{discharges.map((discharge) => (
									<TableRow key={discharge.id}>
										<TableCell>{new Date(discharge.dischargeDate).toLocaleDateString()}</TableCell>
										<TableCell>{discharge.dischargeDiagnosis}</TableCell>
										<TableCell className="font-mono text-sm">{discharge.patientId}</TableCell>
										<TableCell className="max-w-xs truncate">
											{discharge.treatmentProvided}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
					{!isLoading && (!discharges || discharges.length === 0) && (
						<div className="text-center text-muted-foreground">No discharge summaries found</div>
					)}
				</CardContent>
			</Card>
		</DashboardPageShell>
	);
}

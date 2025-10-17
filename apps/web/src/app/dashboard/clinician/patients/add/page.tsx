"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc, trpcClient } from "@/utils/trpc";

const WHITESPACE_REGEX = /\s+/;

function hasPatientIdShape(value: unknown): value is { patientId: string } {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	const v = value as { patientId?: unknown };
	return typeof v.patientId === "string";
}

function hasEmbeddedPatientShape(value: unknown): value is { patient: { id: string } } {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	const v = value as { patient?: unknown };
	if (typeof v.patient !== "object" || v.patient === null) {
		return false;
	}
	const patient = v.patient as { id?: unknown };
	return typeof patient.id === "string";
}

export default function AddPatientPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");

	const { data: availablePatients, isLoading } = useQuery(trpc.patients.getAvailablePatients.queryOptions());

	const { data: currentPatients } = useQuery(trpc.patients.list.queryOptions());

	const addPatient = useMutation({
		mutationFn: (data: { patientId: string }) => trpcClient.patients.addPatient.mutate(data),
		onSuccess: () => {
			toast.success("Patient added successfully!");
			router.push("/dashboard/clinician/patients");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add patient");
		},
	});

	const currentPatientIds = new Set(
		(currentPatients || []).map((p) => {
			if (hasPatientIdShape(p)) {
				return p.patientId;
			}
			if (hasEmbeddedPatientShape(p)) {
				return p.patient.id;
			}
			return "";
		})
	);

	const filteredPatients = (availablePatients || [])
		.filter((p) => !currentPatientIds.has(p.id))
		.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<DashboardPageShell>
			<PageHeader
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/clinician/patients">
							<ArrowLeft className="h-4 w-4" />
							Back to Patients
						</Link>
					</Button>
				}
				breadcrumbItems={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Clinician", href: "/dashboard/clinician" },
					{ label: "Patients", href: "/dashboard/clinician/patients" },
					{ label: "Add Patient" },
				]}
				description="Select a patient to add to your roster"
				icon={<UserPlus className="h-8 w-8" />}
				title="Add Patient"
			/>

			<Card>
				<CardHeader>
					<CardTitle>Available Patients</CardTitle>
					<CardDescription>Select patients from the system to add to your roster</CardDescription>
					<div className="mt-4">
						<Input
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search patients by name..."
							value={searchQuery}
						/>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading && <div className="py-8 text-center text-muted-foreground">Loading patients...</div>}
					{!isLoading && filteredPatients.length === 0 && (
						<div className="py-8 text-center text-muted-foreground">
							{searchQuery ? "No patients found matching your search." : "No available patients to add."}
						</div>
					)}
					{!isLoading && filteredPatients.length > 0 && (
						<div className="space-y-2">
							{filteredPatients.map((patient) => (
								<div
									className="flex items-center justify-between rounded-lg border p-4"
									key={patient.id}
								>
									<div className="flex items-center gap-3">
										<Avatar>
											<AvatarImage alt={patient.name} src={patient.image || undefined} />
											<AvatarFallback>
												{patient.name
													.trim()
													.split(WHITESPACE_REGEX)
													.filter((n) => n.length > 0)
													.map((n) => n.charAt(0))
													.join("")
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className="font-medium">{patient.name}</div>
											<div className="text-muted-foreground text-sm">{patient.email}</div>
										</div>
									</div>
									<Button
										disabled={addPatient.isPending}
										onClick={() => addPatient.mutate({ patientId: patient.id })}
										size="sm"
									>
										<UserPlus className="h-4 w-4" />
										Add Patient
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</DashboardPageShell>
	);
}

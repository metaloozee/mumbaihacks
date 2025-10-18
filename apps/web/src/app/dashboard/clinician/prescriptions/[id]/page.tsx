"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { PrescriptionForm } from "@/components/dashboard/prescription-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog } from "@/components/ui/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc, trpcClient } from "@/utils/trpc";

const APPOINTMENT_ID_PREVIEW_LENGTH = 12;

export default function PrescriptionDetailPage() {
	const params = useParams();
	const prescriptionId = params.id as string;

	const {
		data: prescription,
		isLoading,
		refetch,
	} = useQuery(trpc.prescriptions.getById.queryOptions({ id: prescriptionId }));

	const updatePrescription = useMutation({
		mutationFn: (data: { id: string; status: "active" | "expired" | "filled" | "cancelled" }) =>
			trpcClient.prescriptions.update.mutate(data),
		onSuccess: () => {
			toast.success("Prescription updated successfully!");
			refetch();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update prescription");
		},
	});

	const createPrescription = useMutation({
		mutationFn: (data: Parameters<typeof trpcClient.prescriptions.create.mutate>[0]) =>
			trpcClient.prescriptions.create.mutate(data),
		onSuccess: () => {
			toast.success("Prescription created successfully!");
		},
		onError: (error: Error) => toast.error(error.message || "Failed to create prescription"),
	});

	const { data: appointments } = useQuery(trpc.appointments.list.queryOptions());

	if (isLoading) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Clinician", href: "/dashboard/clinician" },
							{ label: "Prescriptions", href: "/dashboard/clinician/prescriptions" },
							{ label: "Details" },
						]}
						icon={<FileText className="h-8 w-8" />}
						title="Prescription Details"
					/>
				}
			>
				<div className="py-8 text-center text-muted-foreground">Loading prescription...</div>
			</DashboardPageShell>
		);
	}

	if (!prescription) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Clinician", href: "/dashboard/clinician" },
							{ label: "Prescriptions", href: "/dashboard/clinician/prescriptions" },
							{ label: "Details" },
						]}
						icon={<FileText className="h-8 w-8" />}
						title="Prescription Details"
					/>
				}
			>
				<div className="py-8 text-center text-destructive">Prescription not found</div>
			</DashboardPageShell>
		);
	}

	const statusColors: Record<string, string> = {
		active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		filled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
	};

	const expiryDate = new Date(prescription.expiryDate);
	const isExpired = expiryDate < new Date();

	return (
		<DashboardPageShell
			header={
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
						{ label: "Details" },
					]}
					description="View and manage prescription details"
					icon={<FileText className="h-8 w-8" />}
					title="Prescription Details"
				/>
			}
		>
			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Prescription Information</CardTitle>
								<CardDescription>Details about this prescription</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Badge className={statusColors[prescription.status]}>
									{prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
								</Badge>
								{isExpired && prescription.status === "active" ? (
									<Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
										Expired
									</Badge>
								) : null}
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Patient</h4>
								<p className="font-medium text-base">{prescription.patientName}</p>
								<p className="text-muted-foreground text-sm">{prescription.patientEmail}</p>
							</div>
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Appointment ID</h4>
								<p className="font-mono text-sm">
									{prescription.appointmentId.slice(0, APPOINTMENT_ID_PREVIEW_LENGTH)}...
								</p>
								<Link
									className="text-primary text-sm hover:underline"
									href={`/dashboard/clinician/appointments/${prescription.appointmentId}`}
								>
									View Appointment
								</Link>
							</div>
						</div>

						<div className="rounded-lg border bg-muted/30 p-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Medication</h4>
									<p className="font-semibold text-lg">{prescription.medication}</p>
								</div>
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Dosage</h4>
									<p className="font-medium text-base">{prescription.dosage}</p>
								</div>
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Duration</h4>
									<p className="text-base">{prescription.duration}</p>
								</div>
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Refills</h4>
									<p className="text-base">{prescription.refills}</p>
								</div>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Expiry Date</h4>
								<p className="text-base">
									{expiryDate.toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
								{isExpired ? (
									<p className="text-destructive text-sm">This prescription has expired</p>
								) : null}
							</div>
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Status</h4>
								<p className="text-base">
									{prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
								</p>
							</div>
						</div>

						{prescription.instructions ? (
							<div>
								<h4 className="mb-2 font-medium text-muted-foreground text-sm">Instructions</h4>
								<p className="whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm">
									{prescription.instructions}
								</p>
							</div>
						) : (
							<div>
								<h4 className="mb-2 font-medium text-muted-foreground text-sm">Instructions</h4>
								<p className="text-muted-foreground text-sm italic">No special instructions provided</p>
							</div>
						)}

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Created</h4>
								<p className="text-sm">
									{new Date(prescription.createdAt).toLocaleString("en-US", {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</p>
							</div>
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Last Updated</h4>
								<p className="text-sm">
									{new Date(prescription.updatedAt).toLocaleString("en-US", {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Update Status</CardTitle>
						<CardDescription>Change the status of this prescription</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							<Select
								disabled={updatePrescription.isPending}
								onValueChange={(value) =>
									updatePrescription.mutate({
										id: prescriptionId,
										status: value as "active" | "expired" | "filled" | "cancelled",
									})
								}
								value={prescription.status}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="filled">Filled</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
							{updatePrescription.isPending ? (
								<span className="text-muted-foreground text-sm">Updating...</span>
							) : null}
						</div>
					</CardContent>
				</Card>

				<div className="flex gap-4">
					<FormDialog
						maxWidthClassName="sm:max-w-2xl"
						trigger={<Button variant="outline">Create Renewal</Button>}
					>
						<PrescriptionForm
							appointments={
								appointments?.map((a) => ({
									id: a.id,
									patientName: a.patientId,
									date: new Date(a.scheduledAt).toLocaleDateString(),
								})) || []
							}
							defaultAppointmentId={prescription.appointmentId}
							onSubmit={(data) => createPrescription.mutate(data)}
						/>
					</FormDialog>
				</div>
			</div>
		</DashboardPageShell>
	);
}

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pill } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/date-utils";
import { trpc, trpcClient } from "@/utils/trpc";

export default function PatientPrescriptionDetailPage() {
	const params = useParams();
	const prescriptionId = params.id as string;
	const [refillDialogOpen, setRefillDialogOpen] = useState(false);

	const {
		data: prescription,
		isLoading,
		refetch,
	} = useQuery(trpc.prescriptions.getById.queryOptions({ id: prescriptionId }));

	const requestRefill = useMutation({
		mutationFn: (id: string) => trpcClient.prescriptions.requestRefill.mutate({ id }),
		onSuccess: () => {
			toast.success("Refill requested successfully!");
			setRefillDialogOpen(false);
			refetch();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to request refill");
		},
	});

	const handleRefillConfirm = () => {
		requestRefill.mutate(prescriptionId);
	};

	if (isLoading) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Prescriptions", href: "/dashboard/patient/prescriptions" },
							{ label: "Details" },
						]}
						icon={<Pill className="h-8 w-8" />}
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
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Prescriptions", href: "/dashboard/patient/prescriptions" },
							{ label: "Details" },
						]}
						icon={<Pill className="h-8 w-8" />}
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
		expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		filled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
	};

	return (
		<>
			<DashboardPageShell
				header={
					<PageHeader
						actions={
							<Button asChild variant="outline">
								<Link href="/dashboard/patient/prescriptions">
									<ArrowLeft className="h-4 w-4" />
									Back to Prescriptions
								</Link>
							</Button>
						}
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Prescriptions", href: "/dashboard/patient/prescriptions" },
							{ label: "Details" },
						]}
						description="View prescription details"
						icon={<Pill className="h-8 w-8" />}
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
									<CardDescription>Details about your medication</CardDescription>
								</div>
								<Badge className={statusColors[prescription.status]}>
									{prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Medication</h4>
									<p className="font-medium text-lg">{prescription.medication}</p>
								</div>
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Dosage</h4>
									<p className="text-base">{prescription.dosage}</p>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Duration</h4>
									<p className="text-base">{prescription.duration}</p>
								</div>
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Refills</h4>
									<p className="text-base">{prescription.refills}</p>
								</div>
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Expiry Date</h4>
									<p className="text-base">{formatDate(prescription.expiryDate)}</p>
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
									<p className="text-muted-foreground text-sm italic">No instructions provided</p>
								</div>
							)}

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Prescribed By</h4>
									<p className="font-medium text-base">Dr. {prescription.patientName || "Unknown"}</p>
									<p className="text-muted-foreground text-sm">{prescription.patientEmail}</p>
								</div>
								<div>
									<h4 className="mb-1 font-medium text-muted-foreground text-sm">Prescribed On</h4>
									<p className="text-sm">
										{new Date(prescription.createdAt).toLocaleString("en-US", {
											dateStyle: "medium",
											timeStyle: "short",
										})}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{prescription.status === "active" && (
						<Card>
							<CardHeader>
								<CardTitle>Actions</CardTitle>
								<CardDescription>Request a refill for this prescription</CardDescription>
							</CardHeader>
							<CardContent>
								<Button onClick={() => setRefillDialogOpen(true)} variant="default">
									Request Refill
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</DashboardPageShell>

			<Dialog onOpenChange={setRefillDialogOpen} open={refillDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Request Prescription Refill</DialogTitle>
						<DialogDescription>
							You are about to request a refill for this prescription. The clinician will be notified and
							will process your request.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2 rounded-md border bg-muted/50 p-4">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Medication:</span>
							<span className="font-medium">{prescription.medication}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Dosage:</span>
							<span className="font-medium">{prescription.dosage}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Current Refills:</span>
							<span className="font-medium">{prescription.refills}</span>
						</div>
					</div>

					<DialogFooter>
						<Button onClick={() => setRefillDialogOpen(false)} type="button" variant="outline">
							Cancel
						</Button>
						<Button disabled={requestRefill.isPending} onClick={handleRefillConfirm} type="button">
							{requestRefill.isPending ? "Requesting..." : "Confirm Request"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

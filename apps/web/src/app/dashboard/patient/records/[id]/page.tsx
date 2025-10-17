"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

export default function PatientMedicalRecordDetailPage() {
	const params = useParams();
	const recordId = params.id as string;

	const { data: record, isLoading } = useQuery(trpc.medicalRecords.getById.queryOptions({ id: recordId }));

	if (isLoading) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Medical Records", href: "/dashboard/patient/records" },
							{ label: "Details" },
						]}
						icon={<FileText className="h-8 w-8" />}
						title="Medical Record Details"
					/>
				}
			>
				<div className="py-8 text-center text-muted-foreground">Loading medical record...</div>
			</DashboardPageShell>
		);
	}

	if (!record) {
		return (
			<DashboardPageShell
				header={
					<PageHeader
						breadcrumbItems={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Patient", href: "/dashboard/patient" },
							{ label: "Medical Records", href: "/dashboard/patient/records" },
							{ label: "Details" },
						]}
						icon={<FileText className="h-8 w-8" />}
						title="Medical Record Details"
					/>
				}
			>
				<div className="py-8 text-center text-destructive">Medical record not found</div>
			</DashboardPageShell>
		);
	}

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Button asChild variant="outline">
							<Link href="/dashboard/patient/records">
								<ArrowLeft className="h-4 w-4" />
								Back to Medical Records
							</Link>
						</Button>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Patient", href: "/dashboard/patient" },
						{ label: "Medical Records", href: "/dashboard/patient/records" },
						{ label: "Details" },
					]}
					description="View medical record details"
					icon={<FileText className="h-8 w-8" />}
					title="Medical Record Details"
				/>
			}
		>
			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Medical Record Information</CardTitle>
						<CardDescription>Details about this medical record</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Clinician</h4>
								<p className="font-medium text-base">Dr. {record.clinicianName || "Unknown"}</p>
								<p className="text-muted-foreground text-sm">{record.clinicianEmail}</p>
							</div>
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Date</h4>
								<p className="text-base">
									{new Date(record.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>

						<div>
							<h4 className="mb-2 font-medium text-muted-foreground text-sm">Diagnosis</h4>
							<p className="rounded-md border bg-muted/50 p-3 font-medium text-base">
								{record.diagnosis}
							</p>
						</div>

						{record.notes ? (
							<div>
								<h4 className="mb-2 font-medium text-muted-foreground text-sm">Clinical Notes</h4>
								<p className="whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm">
									{record.notes}
								</p>
							</div>
						) : (
							<div>
								<h4 className="mb-2 font-medium text-muted-foreground text-sm">Clinical Notes</h4>
								<p className="text-muted-foreground text-sm italic">No clinical notes recorded</p>
							</div>
						)}

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Created</h4>
								<p className="text-sm">
									{new Date(record.createdAt).toLocaleString("en-US", {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</p>
							</div>
							<div>
								<h4 className="mb-1 font-medium text-muted-foreground text-sm">Last Updated</h4>
								<p className="text-sm">
									{new Date(record.updatedAt).toLocaleString("en-US", {
										dateStyle: "medium",
										timeStyle: "short",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardPageShell>
	);
}

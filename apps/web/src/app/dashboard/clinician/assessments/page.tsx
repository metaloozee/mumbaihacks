"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

export default function AssessmentsPage() {
	const { data: assessments, isLoading } = useQuery(trpc.assessments.list.queryOptions());

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Button asChild>
							<Link href="/dashboard/clinician/assessments/new">
								<Plus className="h-4 w-4" />
								New Assessment
							</Link>
						</Button>
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

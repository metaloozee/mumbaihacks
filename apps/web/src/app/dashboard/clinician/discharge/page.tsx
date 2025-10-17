"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

export default function DischargePage() {
	const { data: discharges, isLoading } = useQuery(trpc.discharge.list.queryOptions());

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Button asChild>
							<Link href="/dashboard/clinician/discharge/new">
								<Plus className="h-4 w-4" />
								New Discharge Summary
							</Link>
						</Button>
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

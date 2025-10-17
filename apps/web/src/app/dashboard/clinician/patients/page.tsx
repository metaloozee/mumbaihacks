"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";

// DO NOT use the RouterOutput type to directly infer types from the tRPC router since it returns the complete output's type structure which may include nested conditional types that is not relevant here.
type ClinicianPatientRecord = {
	id: string;
	patientId: string;
	createdAt: string;
	patient: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	};
};

const WHITESPACE_REGEX = /\s+/;

export default function ClinicianPatientsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const { data: patients, isLoading } = useQuery(trpc.patients.list.queryOptions());

	const filteredPatients = ((patients as ClinicianPatientRecord[]) || []).filter((p) =>
		p.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const columns: ColumnDef<ClinicianPatientRecord>[] = [
		{
			id: "patient",
			header: "Patient",
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<Avatar>
						<AvatarImage alt={row.original.patient.name} src={row.original.patient.image ?? undefined} />
						<AvatarFallback>
							{row.original.patient.name
								.trim()
								.split(WHITESPACE_REGEX)
								.filter((n: string) => n.length > 0)
								.map((n: string) => n.charAt(0))
								.join("")
								.toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">{row.original.patient.name}</div>
						<div className="text-muted-foreground text-sm">{row.original.patient.email}</div>
					</div>
				</div>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Patient Since",
			cell: ({ getValue }) => {
				const dateValue = getValue() as Date | string;
				const date = new Date(dateValue);
				if (Number.isNaN(date.getTime())) {
					return "Invalid date";
				}
				return date.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex gap-2">
					<Button asChild size="sm" variant="outline">
						{/* @ts-ignore */}
						<Link href={`/dashboard/clinician/records?patientId=${row.original.patientId}`}>
							View Records
						</Link>
					</Button>
					<Button asChild size="sm" variant="outline">
						{/* @ts-ignore */}
						<Link href={`/dashboard/clinician/appointments/new?patientId=${row.original.patientId}`}>
							Schedule
						</Link>
					</Button>
				</div>
			),
		},
	];

	return (
		<DashboardPageShell
			header={
				<PageHeader
					actions={
						<Button asChild>
							<Link href="/dashboard/clinician/patients/add">
								<Plus className="h-4 w-4" />
								Add Patient
							</Link>
						</Button>
					}
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Clinician", href: "/dashboard/clinician" },
						{ label: "Patients" },
					]}
					description="Manage your patient roster"
					icon={<Users className="h-8 w-8" />}
					title="My Patients"
				/>
			}
		>
			<ListCard
				actions={
					<div className="relative w-64">
						<Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
						<Input
							className="pl-8"
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search patients..."
							value={searchQuery}
						/>
					</div>
				}
				title="All Patients"
			>
				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground">Loading patients...</div>
				) : (
					<DataTable
						columns={columns}
						data={filteredPatients}
						emptyMessage="No patients found. Add your first patient to get started."
					/>
				)}
			</ListCard>
		</DashboardPageShell>
	);
}

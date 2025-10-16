"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PatientRecord = {
	id: string;
	patientId: string;
	patient: {
		id: string;
		name: string;
		email: string;
		image?: string;
	};
	createdAt: string;
};

const WHITESPACE_REGEX = /\s+/;

export default function ClinicianPatientsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// TODO: Fetch patients using tRPC
	const patients: PatientRecord[] = [];

	const filteredPatients = patients.filter((p) => p.patient.name.toLowerCase().includes(searchQuery.toLowerCase()));

	const columns: ColumnDef<PatientRecord>[] = [
		{
			id: "patient",
			header: "Patient",
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<Avatar>
						<AvatarImage alt={row.original.patient.name} src={row.original.patient.image} />
						<AvatarFallback>
							{row.original.patient.name
								.trim()
								.split(WHITESPACE_REGEX)
								.filter((n) => n.length > 0)
								.map((n) => n.charAt(0))
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
				const date = new Date(getValue() as string);
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
			cell: () => (
				<div className="flex gap-2">
					<Button disabled size="sm" variant="outline">
						View Records
					</Button>
					<Button disabled size="sm" variant="outline">
						Schedule Appointment
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
						<Button disabled>
							<Plus className="mr-2 h-4 w-4" />
							Add Patient
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
				<DataTable
					columns={columns}
					data={filteredPatients}
					emptyMessage="No patients found. Add your first patient to get started."
				/>
			</ListCard>
		</DashboardPageShell>
	);
}

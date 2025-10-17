"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Activity,
	ArrowLeft,
	Calendar,
	ClipboardList,
	FileText,
	Mail,
	Pill,
	Shield,
	UserCheck,
	Users,
} from "lucide-react";
import Link from "next/link";
import { use as reactUse } from "react";
import { ListCard } from "@/components/dashboard/list-card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/utils/trpc";

type Params = Promise<{ id: string }>;

type PatientRelationship = {
	id: string;
	patientId: string;
	patientName: string;
	patientEmail: string;
	patientImage: string | null;
	createdAt: Date;
};

type ClinicianRelationship = {
	id: string;
	clinicianId: string;
	clinicianName: string;
	clinicianEmail: string;
	clinicianImage: string | null;
	createdAt: Date;
};

type Appointment = {
	id: string;
	patientId: string;
	clinicianId: string;
	patientName: string;
	clinicianName: string;
	scheduledAt: Date;
	status: string;
	notes: string | null;
	createdAt: Date;
};

type MedicalRecord = {
	id: string;
	patientId: string;
	clinicianId: string;
	diagnosis: string;
	notes: string | null;
	createdAt: Date;
};

type Prescription = {
	id: string;
	appointmentId: string;
	prescriberId: string;
	medication: string;
	dosage: string;
	duration: string;
	refills: number;
	expiryDate: Date;
	status: string;
	instructions: string | null;
	createdAt: Date;
};

function getAppointmentStatusVariant(status: string) {
	if (status === "completed") {
		return "default";
	}
	if (status === "cancelled") {
		return "destructive";
	}
	return "secondary";
}

function getPrescriptionStatusVariant(status: string) {
	if (status === "active") {
		return "default";
	}
	if (status === "filled") {
		return "secondary";
	}
	return "outline";
}

function LoadingState() {
	return (
		<DashboardPageShell>
			<div className="flex items-center gap-4">
				<Skeleton className="h-10 w-10 rounded-md" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				{Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
					<Card key={key}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-24 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</DashboardPageShell>
	);
}

function NotFoundState() {
	return (
		<div className="flex min-h-screen flex-1 items-center justify-center">
			<div className="text-center">
				<h2 className="font-bold text-2xl">User Not Found</h2>
				<p className="mt-2 text-muted-foreground">The user you're looking for doesn't exist.</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard/admin/users">Back to Users</Link>
				</Button>
			</div>
		</div>
	);
}

type RelationshipsCardProps = {
	user: {
		role: "patient" | "clinician" | "admin";
	};
	relationships: {
		patients?: PatientRelationship[];
		clinicians?: ClinicianRelationship[];
	};
};

function RelationshipsCard({ user, relationships }: RelationshipsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Relationships
				</CardTitle>
				<CardDescription>
					{user.role === "clinician" && "Patients under this clinician's care"}
					{user.role === "patient" && "Clinicians treating this patient"}
					{user.role === "admin" && "No relationships for admin users"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{user.role === "clinician" && relationships.patients && (
					<div className="space-y-2">
						{relationships.patients.length === 0 ? (
							<p className="text-muted-foreground text-sm">No patients assigned yet</p>
						) : (
							<div className="space-y-2">
								{relationships.patients.map((rel) => (
									<div className="flex items-center gap-2 rounded-lg border p-2" key={rel.id}>
										<Avatar className="h-8 w-8">
											<AvatarImage alt={rel.patientName} src={rel.patientImage ?? undefined} />
											<AvatarFallback className="text-xs">
												{rel.patientName
													.split(" ")
													.map((n: string) => n[0])
													.join("")
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="font-medium text-sm">{rel.patientName}</p>
											<p className="text-muted-foreground text-xs">{rel.patientEmail}</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
				{user.role === "patient" && relationships.clinicians && (
					<div className="space-y-2">
						{relationships.clinicians.length === 0 ? (
							<p className="text-muted-foreground text-sm">No assigned clinicians</p>
						) : (
							<div className="space-y-2">
								{relationships.clinicians.map((rel) => (
									<div className="flex items-center gap-2 rounded-lg border p-2" key={rel.id}>
										<Avatar className="h-8 w-8">
											<AvatarImage
												alt={rel.clinicianName}
												src={rel.clinicianImage ?? undefined}
											/>
											<AvatarFallback className="text-xs">
												{rel.clinicianName
													.split(" ")
													.map((n: string) => n[0])
													.join("")
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="font-medium text-sm">{rel.clinicianName}</p>
											<p className="text-muted-foreground text-xs">{rel.clinicianEmail}</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
				{user.role === "admin" && <p className="text-muted-foreground text-sm">No relationships</p>}
			</CardContent>
		</Card>
	);
}

export default function UserDetailsPage({ params }: { params: Params }) {
	const unwrappedParams = reactUse(params);
	const userId = unwrappedParams.id;

	const { data: userDetails, isPending } = useQuery(trpc.users.getDetails.queryOptions({ id: userId }));

	if (isPending) {
		return <LoadingState />;
	}

	if (!userDetails) {
		return <NotFoundState />;
	}

	const { user, relationships, appointments, medicalRecords, prescriptions } = userDetails as unknown as {
		user: typeof userDetails.user;
		relationships: typeof userDetails.relationships;
		appointments: Appointment[];
		medicalRecords: MedicalRecord[];
		prescriptions: Prescription[];
	};

	return (
		<DashboardPageShell>
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Button asChild size="icon" variant="ghost">
						<Link href="/dashboard/admin/users">
							<ArrowLeft className="h-5 w-5" />
						</Link>
					</Button>
					<Avatar className="h-16 w-16 rounded-md">
						<AvatarImage alt={user.name} src={user.image ?? undefined} />
						<AvatarFallback className="text-lg">
							{user.name
								.split(" ")
								.filter((n: string) => n.length > 0)
								.map((n: string) => n[0])
								.join("")
								.toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1">
						<h1 className="font-bold text-3xl">{user.name}</h1>
						<div className="mt-1 flex items-center gap-2 text-muted-foreground">
							<Mail className="h-4 w-4" />
							<span>{user.email}</span>
							{user.emailVerified && (
								<Badge className="ml-2" variant="outline">
									<UserCheck className="h-3 w-3" />
									Verified
								</Badge>
							)}
						</div>
					</div>
				</div>
				<Badge className="text-sm" variant="default">
					<Shield className="h-4 w-4" />
					{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
				</Badge>
			</div>

			{/* Basic Information */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Activity className="h-5 w-5" />
							Account Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-2">
							<span className="text-muted-foreground text-sm">User ID:</span>
							<span className="font-mono text-sm">{user.id}</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<span className="text-muted-foreground text-sm">Joined:</span>
							<span className="text-sm">
								{new Date(user.createdAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<span className="text-muted-foreground text-sm">Last Updated:</span>
							<span className="text-sm">
								{new Date(user.updatedAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						</div>
					</CardContent>
				</Card>

				<RelationshipsCard
					relationships={
						relationships as {
							patients?: PatientRelationship[];
							clinicians?: ClinicianRelationship[];
						}
					}
					user={user}
				/>
			</div>

			{/* Appointments */}
			<ListCard
				title={
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Recent Appointments
					</div>
				}
			>
				{appointments.length === 0 ? (
					<p className="text-center text-muted-foreground text-sm">No appointments found</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Patient</TableHead>
								<TableHead>Clinician</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Notes</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{appointments.map((appt: Appointment) => (
								<TableRow key={appt.id}>
									<TableCell>
										{new Date(appt.scheduledAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</TableCell>
									<TableCell>{appt.patientName}</TableCell>
									<TableCell>{appt.clinicianName}</TableCell>
									<TableCell>
										<Badge
											variant={
												getAppointmentStatusVariant(appt.status) as
													| "default"
													| "destructive"
													| "secondary"
											}
										>
											{appt.status}
										</Badge>
									</TableCell>
									<TableCell className="max-w-xs truncate">{appt.notes ?? "-"}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</ListCard>

			{/* Medical Records */}
			<ListCard
				title={
					<div className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Medical Records
					</div>
				}
			>
				{medicalRecords.length === 0 ? (
					<p className="text-center text-muted-foreground text-sm">No medical records found</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Diagnosis</TableHead>
								<TableHead>Notes</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{medicalRecords.map((record: MedicalRecord) => (
								<TableRow key={record.id}>
									<TableCell>
										{new Date(record.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</TableCell>
									<TableCell className="font-medium">{record.diagnosis}</TableCell>
									<TableCell className="max-w-xs truncate">{record.notes ?? "-"}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</ListCard>

			{/* Prescriptions (only for clinicians) */}
			{user.role === "clinician" && (
				<ListCard
					title={
						<div className="flex items-center gap-2">
							<Pill className="h-5 w-5" />
							Prescriptions Issued
						</div>
					}
				>
					{prescriptions.length === 0 ? (
						<p className="text-center text-muted-foreground text-sm">No prescriptions found</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Medication</TableHead>
									<TableHead>Dosage</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Expiry</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{prescriptions.map((rx: Prescription) => (
									<TableRow key={rx.id}>
										<TableCell>
											{new Date(rx.createdAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</TableCell>
										<TableCell className="font-medium">{rx.medication}</TableCell>
										<TableCell>{rx.dosage}</TableCell>
										<TableCell>{rx.duration}</TableCell>
										<TableCell>
											<Badge
												variant={
													getPrescriptionStatusVariant(rx.status) as
														| "default"
														| "secondary"
														| "outline"
												}
											>
												{rx.status}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(rx.expiryDate).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</ListCard>
			)}

			{/* Summary Statistics */}
			<div className="grid gap-6 md:grid-cols-3">
				<StatsCard
					description="Recent appointments shown"
					icon={<ClipboardList className="h-4 w-4" />}
					title="Total Appointments"
					value={appointments.length}
				/>

				<StatsCard
					description="Records on file"
					icon={<FileText className="h-4 w-4" />}
					title="Medical Records"
					value={medicalRecords.length}
				/>

				{user.role === "clinician" && (
					<StatsCard
						description="Recent prescriptions"
						icon={<Pill className="h-4 w-4" />}
						title="Prescriptions Issued"
						value={prescriptions.length}
					/>
				)}

				{user.role === "patient" && (
					<StatsCard
						description="Assigned clinicians"
						icon={<Users className="h-4 w-4" />}
						title="Care Team Size"
						value={relationships.clinicians?.length ?? 0}
					/>
				)}
			</div>
		</DashboardPageShell>
	);
}

"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EASE_OUT_BACK_X = 0.16;
const EASE_OUT_BACK_Y = 1;
const EASE_OUT_BACK_Z = 0.3;
const EASE_OUT_BACK_W = 1;
const ANIM_EASE = [EASE_OUT_BACK_X, EASE_OUT_BACK_Y, EASE_OUT_BACK_Z, EASE_OUT_BACK_W] as const;
const ANIM_DURATION = 0.6;
const VIEWPORT_MARGIN = "-80px";
const MAX_NOTES_WIDTH = 220;

const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

type AppointmentRow = {
	id: string;
	patient: { name: string };
	clinician: string;
	date: string;
	status: Status;
	notes: string;
};

function statusDotClass(status: Status): string {
	switch (status) {
		case "Completed":
			return "bg-emerald-500";
		case "Cancelled":
			return "bg-red-500";
		default:
			return "bg-amber-500"; // Scheduled
	}
}

export function ProductShowcase() {
	const [appointments, setAppointments] = useState<AppointmentRow[]>([
		{
			id: "apt-1",
			patient: { name: "A. Patel" },
			clinician: "Dr. Rao",
			date: "Oct 12, 2025",
			status: "Completed",
			notes: "Follow-up in 2 weeks",
		},
		{
			id: "apt-2",
			patient: { name: "M. Singh" },
			clinician: "Dr. Kapoor",
			date: "Oct 13, 2025",
			status: "Scheduled",
			notes: "Annual checkup",
		},
		{
			id: "apt-3",
			patient: { name: "R. Khan" },
			clinician: "Dr. Iyer",
			date: "Oct 14, 2025",
			status: "Cancelled",
			notes: "Patient request",
		},
		{
			id: "apt-4",
			patient: { name: "S. Mehta" },
			clinician: "Dr. Banerjee",
			date: "Oct 15, 2025",
			status: "Scheduled",
			notes: "New patient intake",
		},
		{
			id: "apt-5",
			patient: { name: "P. Sharma" },
			clinician: "Dr. Gupta",
			date: "Oct 16, 2025",
			status: "Completed",
			notes: "Blood work reviewed",
		},
		{
			id: "apt-6",
			patient: { name: "N. Joshi" },
			clinician: "Dr. Rao",
			date: "Oct 17, 2025",
			status: "Scheduled",
			notes: "X-ray pending",
		},
		{
			id: "apt-7",
			patient: { name: "L. Desai" },
			clinician: "Dr. Kapoor",
			date: "Oct 18, 2025",
			status: "Cancelled",
			notes: "Scheduling conflict",
		},
	]);

	const updateAppointmentStatus = (id: string, next: Status) => {
		setAppointments((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
	};

	const [bookingConfirmed, setBookingConfirmed] = useState(false);

	return (
		<section className="container mx-auto max-w-6xl px-4 pb-12">
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				transition={{ duration: ANIM_DURATION, ease: ANIM_EASE }}
				viewport={{ once: true, margin: VIEWPORT_MARGIN }}
				whileInView={{ opacity: 1, y: 0 }}
			>
				<Card>
					<CardHeader>
						<CardTitle>Modern EHR workspace</CardTitle>
						<CardDescription>
							Unified appointments, records, and prescriptions linked by patient & clinician.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 md:grid-cols-3">
							<div className="md:col-span-2">
								<div className="mb-3 text-muted-foreground text-xs">Recent appointments</div>
								<div className="overflow-hidden rounded-xl border">
									<Table>
										<TableHeader className="bg-muted/30">
											<TableRow className="[&_th]:text-muted-foreground [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider">
												<TableHead>Patient</TableHead>
												<TableHead>Clinician</TableHead>
												<TableHead>Date</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Notes</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{appointments.map((row) => (
												<TableRow className="hover:bg-muted/40" key={row.id}>
													<TableCell>
														<div className="flex items-center gap-2">
															<Avatar>
																<AvatarFallback>
																	{row.patient.name.slice(0, 1)}
																</AvatarFallback>
															</Avatar>
															<span className="font-medium">{row.patient.name}</span>
														</div>
													</TableCell>
													<TableCell>{row.clinician}</TableCell>
													<TableCell>{row.date}</TableCell>
													<TableCell>
														<Select
															onValueChange={(v) =>
																updateAppointmentStatus(row.id, v as Status)
															}
															value={row.status}
														>
															<SelectTrigger
																aria-label={`Change status for ${row.patient.name}`}
																className="h-7 rounded-full border-transparent bg-muted/60 px-2 py-1 hover:bg-muted"
																size="sm"
															>
																<span className="flex items-center gap-2">
																	<span
																		aria-hidden="true"
																		className={`inline-block size-2 rounded-full ${statusDotClass(row.status)}`}
																	/>
																	<SelectValue>{row.status}</SelectValue>
																</span>
															</SelectTrigger>
															<SelectContent align="start">
																{STATUS_OPTIONS.map((s) => (
																	<SelectItem key={s} value={s}>
																		<span className="flex items-center gap-2">
																			<span
																				aria-hidden="true"
																				className={`inline-block size-2 rounded-full ${statusDotClass(s as Status)}`}
																			/>
																			<span>{s}</span>
																		</span>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</TableCell>
													<TableCell
														className="truncate"
														style={{ maxWidth: MAX_NOTES_WIDTH }}
													>
														{row.notes}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
										<TableCaption className="sr-only">
											Example of an EHR appointment list
										</TableCaption>
									</Table>
								</div>
							</div>
							<div>
								<div className="mb-3 text-muted-foreground text-xs">AI‑assisted chat</div>
								<div className="space-y-3">
									{/* User message */}
									<div className="flex items-start gap-3 rounded-lg border p-3">
										<Avatar>
											<AvatarFallback>U</AvatarFallback>
										</Avatar>
										<div className="space-y-1">
											<div className="font-medium text-xs">User</div>
											<p className="text-muted-foreground text-sm">
												Can you book an appointment with{" "}
												<span className="font-medium text-foreground">Dr. Kapoor</span> for next
												Friday?
											</p>
										</div>
									</div>

									{/* Clinician message */}
									<div className="flex items-start gap-3 rounded-lg border p-3">
										<Avatar>
											<AvatarFallback>C</AvatarFallback>
										</Avatar>
										<div className="space-y-1">
											<div className="font-medium text-xs">Clinician</div>
											<p className="text-muted-foreground text-sm">
												@Assistant please book an appointment with{" "}
												<span className="font-medium text-foreground">
													{appointments[1]?.patient.name}
												</span>{" "}
												for next Friday with{" "}
												<span className="font-medium text-foreground">
													{appointments[1]?.clinician}
												</span>
												.
											</p>
										</div>
									</div>

									{/* Assistant response */}
									<div className="flex items-start gap-3 rounded-lg border p-3">
										<Avatar>
											<AvatarFallback>A</AvatarFallback>
										</Avatar>
										<div className="w-full space-y-2">
											<div className="font-medium text-xs">Assistant</div>
											{bookingConfirmed ? (
												<output aria-live="polite" className="text-sm">
													<div className="mb-1 font-medium">Appointment booked</div>
													<p className="text-muted-foreground">
														{appointments[1]?.patient.name} with{" "}
														{appointments[1]?.clinician} on{" "}
														<span className="font-medium text-foreground">
															Fri, Oct 17, 2025
														</span>{" "}
														at <span className="font-medium text-foreground">10:00 AM</span>
														.
													</p>
												</output>
											) : (
												<div className="w-full rounded-lg border p-3">
													<div className="mb-2 font-medium text-sm">Proposed appointment</div>
													<dl className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
														<div className="col-span-2 flex justify-between">
															<dt>Patient</dt>
															<dd className="text-foreground">
																{appointments[1]?.patient.name}
															</dd>
														</div>
														<div className="col-span-2 flex justify-between">
															<dt>Clinician</dt>
															<dd className="text-foreground">
																{appointments[1]?.clinician}
															</dd>
														</div>
														<div className="col-span-2 flex justify-between">
															<dt>Date</dt>
															<dd className="text-foreground">Fri, Oct 17, 2025</dd>
														</div>
														<div className="col-span-2 flex justify-between">
															<dt>Time</dt>
															<dd className="text-foreground">10:00 AM</dd>
														</div>
													</dl>
													<div className="mt-3 flex items-center gap-2">
														<button
															className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground text-xs shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
															onClick={() => setBookingConfirmed(true)}
															type="button"
														>
															Confirm booking
														</button>
														<button
															className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 font-medium text-foreground text-xs shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
															onClick={() => setBookingConfirmed(false)}
															type="button"
														>
															Cancel
														</button>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</section>
	);
}

export default ProductShowcase;

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDate } from "@/lib/date-utils";

type PrescriptionFormData = {
	appointmentId: string;
	medication: string;
	dosage: string;
	duration: string;
	refills: number;
	expiryDate: string;
	instructions?: string;
};

type PrescriptionFormProps = {
	onSubmit?: (data: PrescriptionFormData) => void;
	onCancel?: () => void;
	appointments?: Array<{ id: string; patientName: string; date: string }>;
	defaultAppointmentId?: string;
	isPending?: boolean;
};

export function PrescriptionForm({
	onSubmit,
	onCancel,
	appointments = [],
	defaultAppointmentId = "",
	isPending = false,
}: PrescriptionFormProps) {
	const [formData, setFormData] = useState<PrescriptionFormData>({
		appointmentId: defaultAppointmentId,
		medication: "",
		dosage: "",
		duration: "",
		refills: 0,
		expiryDate: "",
		instructions: "",
	});
	const [expiry, setExpiry] = useState<Date | undefined>(undefined);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const date = expiry ?? toDate(formData.expiryDate) ?? undefined;
		const iso = date ? new Date(date).toISOString() : formData.expiryDate;
		onSubmit?.({ ...formData, expiryDate: iso });
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>New Prescription</CardTitle>
					<CardDescription>Specify medication details, duration, and instructions.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="appointment">Appointment</Label>
						<Select
							onValueChange={(value) => setFormData({ ...formData, appointmentId: value })}
							value={formData.appointmentId}
						>
							<SelectTrigger id="appointment">
								<SelectValue placeholder="Select appointment" />
							</SelectTrigger>
							<SelectContent>
								{appointments.map((appointment) => (
									<SelectItem key={appointment.id} value={appointment.id}>
										{appointment.patientName} - {appointment.date}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="medication">Medication</Label>
							<Input
								id="medication"
								onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
								placeholder="Medication name"
								required
								value={formData.medication}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="dosage">Dosage</Label>
							<Input
								id="dosage"
								onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
								placeholder="e.g., 500mg"
								required
								value={formData.dosage}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="duration">Duration</Label>
							<Input
								id="duration"
								onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
								placeholder="e.g., 7 days"
								required
								value={formData.duration}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="refills">Refills</Label>
							<Input
								id="refills"
								min="0"
								onChange={(e) => setFormData({ ...formData, refills: Number(e.target.value) })}
								required
								type="number"
								value={formData.refills}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="expiryDate">Expiry Date</Label>
							<DatePicker id="expiryDate" onChange={setExpiry} value={expiry} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="instructions">Instructions (Optional)</Label>
							<Textarea
								id="instructions"
								onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
								placeholder="e.g., Take with food"
								value={formData.instructions}
							/>
						</div>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					{onCancel && (
						<Button disabled={isPending} onClick={onCancel} type="button" variant="outline">
							Cancel
						</Button>
					)}
					<Button disabled={isPending} type="submit">
						{isPending ? "Creating..." : "Create Prescription"}
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}

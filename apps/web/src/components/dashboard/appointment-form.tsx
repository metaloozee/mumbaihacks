"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker, type TimePickerValue } from "@/components/ui/time-picker";
import { combineDateAndTime, toDate } from "@/lib/date-utils";

type AppointmentFormData = {
	patientId: string;
	clinicianId: string;
	scheduledAt: string;
	notes?: string;
};

type AppointmentFormProps = {
	onSubmit?: (data: AppointmentFormData) => void;
	onCancel?: () => void;
	patients?: Array<{ id: string; name: string }>;
	clinicians?: Array<{ id: string; name: string }>;
	defaultPatientId?: string;
	defaultClinicianId?: string;
	isLoading?: boolean;
};

export function AppointmentForm({
	onSubmit,
	onCancel,
	patients = [],
	clinicians = [],
	defaultPatientId = "",
	defaultClinicianId = "",
	isLoading = false,
}: AppointmentFormProps) {
	const [formData, setFormData] = useState<AppointmentFormData>({
		patientId: defaultPatientId,
		clinicianId: defaultClinicianId,
		scheduledAt: "",
		notes: "",
	});

	const [date, setDate] = useState<Date | undefined>(undefined);
	const [time, setTime] = useState<TimePickerValue>({ hour: 9, minute: 0, second: 0 });

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const chosenDate = date ?? toDate(formData.scheduledAt);
		if (chosenDate) {
			const iso = combineDateAndTime({
				date: chosenDate,
				hour: time.hour,
				minute: time.minute,
				second: time.second ?? 0,
			});
			onSubmit?.({ ...formData, scheduledAt: iso });
			return;
		}
		onSubmit?.(formData);
	};

	return (
		<form className="w-full" onSubmit={handleSubmit}>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>New Appointment</CardTitle>
					<CardDescription>Schedule a visit by selecting the patient, clinician, and time.</CardDescription>
				</CardHeader>
				<CardContent className="w-full space-y-6">
					<div className="flex items-center justify-start gap-6">
						<div className="space-y-2">
							<Label htmlFor="patient">Patient</Label>
							<Select
								disabled={isLoading}
								onValueChange={(value) => setFormData({ ...formData, patientId: value })}
								value={formData.patientId}
							>
								<SelectTrigger id="patient">
									<SelectValue placeholder="Select patient" />
								</SelectTrigger>
								<SelectContent>
									{patients.map((patient) => (
										<SelectItem key={patient.id} value={patient.id}>
											{patient.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="clinician">Clinician</Label>
							<Select
								disabled={isLoading}
								onValueChange={(value) => setFormData({ ...formData, clinicianId: value })}
								value={formData.clinicianId}
							>
								<SelectTrigger id="clinician">
									<SelectValue placeholder="Select clinician" />
								</SelectTrigger>
								<SelectContent>
									{clinicians.map((clinician) => (
										<SelectItem key={clinician.id} value={clinician.id}>
											{clinician.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="scheduled-date">Scheduled Date &amp; Time</Label>
						<div className="grid grid-cols-1 gap-4">
							<DatePicker id="scheduled-date" onChange={setDate} value={date} />
							<TimePicker
								className="rounded-md"
								id="scheduled-time"
								infinite={false}
								onChange={(v) => setTime(v)}
								twentyFourHour={false}
								value={time}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">Notes (Optional)</Label>
						<Textarea
							disabled={isLoading}
							id="notes"
							onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
							placeholder="Add context for this appointment (symptoms, preferences, etc.)"
							value={formData.notes}
						/>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					{onCancel && (
						<Button disabled={isLoading} onClick={onCancel} type="button" variant="outline">
							Cancel
						</Button>
					)}
					<Button disabled={isLoading} type="submit">
						{isLoading ? "Creating..." : "Create Appointment"}
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}

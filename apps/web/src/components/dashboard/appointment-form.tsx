"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
};

export function AppointmentForm({
	onSubmit,
	onCancel,
	patients = [],
	clinicians = [],
	defaultPatientId = "",
	defaultClinicianId = "",
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
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<Label htmlFor="patient">Patient</Label>
				<Select
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

			<div className="space-y-2">
				<Label htmlFor="scheduled-date">Scheduled Date & Time</Label>
				<div className="grid grid-cols-2 gap-4">
					<DatePicker id="scheduled-date" onChange={setDate} value={date} />
					<TimePicker id="scheduled-time" onChange={(v) => setTime(v)} value={time} />
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="notes">Notes (Optional)</Label>
				<Input
					id="notes"
					onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
					placeholder="Additional notes..."
					value={formData.notes}
				/>
			</div>

			<div className="flex justify-end space-x-2">
				{onCancel && (
					<Button onClick={onCancel} type="button" variant="outline">
						Cancel
					</Button>
				)}
				<Button type="submit">Create Appointment</Button>
			</div>
		</form>
	);
}

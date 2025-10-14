"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
};

export function AppointmentForm({ onSubmit, onCancel, patients = [], clinicians = [] }: AppointmentFormProps) {
	const [formData, setFormData] = useState<AppointmentFormData>({
		patientId: "",
		clinicianId: "",
		scheduledAt: "",
		notes: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
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
				<Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
				<Input
					id="scheduledAt"
					onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
					required
					type="datetime-local"
					value={formData.scheduledAt}
				/>
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MedicalRecordFormData = {
	patientId: string;
	diagnosis: string;
	notes?: string;
};

type MedicalRecordFormProps = {
	onSubmit?: (data: MedicalRecordFormData) => void;
	onCancel?: () => void;
	patients?: Array<{ id: string; name: string }>;
	defaultPatientId?: string;
};

export function MedicalRecordForm({
	onSubmit,
	onCancel,
	patients = [],
	defaultPatientId = "",
}: MedicalRecordFormProps) {
	const [formData, setFormData] = useState<MedicalRecordFormData>({
		patientId: defaultPatientId,
		diagnosis: "",
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
				<Label htmlFor="diagnosis">Diagnosis</Label>
				<Input
					id="diagnosis"
					onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
					placeholder="Enter diagnosis..."
					required
					value={formData.diagnosis}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="notes">Clinical Notes (Optional)</Label>
				<Input
					id="notes"
					onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
					placeholder="Additional clinical notes..."
					value={formData.notes}
				/>
			</div>

			<div className="flex justify-end space-x-2">
				{onCancel && (
					<Button onClick={onCancel} type="button" variant="outline">
						Cancel
					</Button>
				)}
				<Button type="submit">Create Medical Record</Button>
			</div>
		</form>
	);
}

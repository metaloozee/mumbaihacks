"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
		notes: undefined,
	});
	const [patientError, setPatientError] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.patientId || formData.patientId === "") {
			setPatientError("Please select a patient");
			return;
		}

		setPatientError("");
		onSubmit?.(formData);
	};

	const handlePatientChange = (value: string) => {
		setFormData({ ...formData, patientId: value });
		if (value) {
			setPatientError("");
		}
	};

	const isFormValid = formData.patientId !== "" && patients.length > 0;

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>New Medical Record</CardTitle>
					<CardDescription>Document a diagnosis and optional clinical notes.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="patient">
							Patient <span className="text-destructive">*</span>
						</Label>
						<Select onValueChange={handlePatientChange} value={formData.patientId}>
							<SelectTrigger id="patient">
								<SelectValue
									placeholder={patients.length === 0 ? "No patients available" : "Select patient"}
								/>
							</SelectTrigger>
							<SelectContent>
								{patients.length === 0 ? (
									<div className="px-2 py-6 text-center text-muted-foreground text-sm">
										No patients found. Please add a patient first.
									</div>
								) : (
									patients.map((patient) => (
										<SelectItem key={patient.id} value={patient.id}>
											{patient.name}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
						{patientError && <p className="text-destructive text-sm">{patientError}</p>}
						{patients.length === 0 && (
							<p className="text-muted-foreground text-sm">
								No patients are available to create a medical record.
							</p>
						)}
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
						<Textarea
							id="notes"
							onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
							placeholder="Additional clinical notes..."
							value={formData.notes ?? ""}
						/>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					{onCancel && (
						<Button onClick={onCancel} type="button" variant="outline">
							Cancel
						</Button>
					)}
					<Button disabled={!isFormValid} type="submit">
						Create Medical Record
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}

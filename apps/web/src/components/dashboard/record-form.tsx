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
	pastMedicalHistory: string;
	allergies: string;
	currentMedications: string;
	medicationsHistory: string;
	vitals: string;
	symptoms: string;
	treatmentRequired: boolean;
	treatmentDetails: string;
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
		pastMedicalHistory: "",
		allergies: "",
		currentMedications: "",
		medicationsHistory: "",
		vitals: "",
		symptoms: "",
		treatmentRequired: false,
		treatmentDetails: "",
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
			<Card className="max-h-[80vh] w-full">
				<CardHeader>
					<CardTitle>New Medical Record</CardTitle>
					<CardDescription>Document a diagnosis and optional clinical notes.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 overflow-auto">
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

					<div className="space-y-2">
						<Label htmlFor="pastMedicalHistory">Past Medical History</Label>
						<Textarea
							id="pastMedicalHistory"
							onChange={(e) => setFormData({ ...formData, pastMedicalHistory: e.target.value })}
							placeholder="Enter past medical history..."
							value={formData.pastMedicalHistory}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="allergies">Allergies</Label>
						<Textarea
							id="allergies"
							onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
							placeholder="Enter allergies..."
							value={formData.allergies}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="currentMedications">Current Medications</Label>
						<Textarea
							id="currentMedications"
							onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
							placeholder="Enter current medications..."
							value={formData.currentMedications}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="medicationsHistory">Medications History</Label>
						<Textarea
							id="medicationsHistory"
							onChange={(e) => setFormData({ ...formData, medicationsHistory: e.target.value })}
							placeholder="Enter medications history..."
							value={formData.medicationsHistory}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="vitals">Vitals</Label>
						<Textarea
							id="vitals"
							onChange={(e) => setFormData({ ...formData, vitals: e.target.value })}
							placeholder="Enter vitals..."
							value={formData.vitals}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="symptoms">Symptoms</Label>
						<Textarea
							id="symptoms"
							onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
							placeholder="Enter symptoms..."
							value={formData.symptoms}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="treatmentRequired">
							Treatment Required <span className="text-destructive">*</span>
						</Label>
						<Select
							onValueChange={(value) => setFormData({ ...formData, treatmentRequired: value === "yes" })}
							value={formData.treatmentRequired ? "yes" : "no"}
						>
							<SelectTrigger id="treatmentRequired">
								<SelectValue placeholder={"Select an option"} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="yes">Yes</SelectItem>
								<SelectItem value="no">No</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="treatmentDetails">Treatment Details</Label>
						<Textarea
							disabled={!formData.treatmentRequired}
							id="treatmentDetails"
							onChange={(e) => setFormData({ ...formData, treatmentDetails: e.target.value })}
							placeholder="Enter treatment details..."
							value={formData.treatmentDetails}
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

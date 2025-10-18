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

type DischargeFormData = {
	patientId: string;
	appointmentId?: string;
	dischargeDate: string;
	dischargeDiagnosis: string;
	treatmentProvided: string;
	followUpInstructions?: string;
	medications?: string;
	restrictions?: string;
};

type DischargeFormProps = {
	onSubmit?: (data: DischargeFormData) => void;
	onCancel?: () => void;
	patients?: Array<{ id: string; name: string }>;
	appointments?: Array<{ id: string; patientName: string; date: string }>;
};

export function DischargeForm({ onSubmit, onCancel, patients = [], appointments = [] }: DischargeFormProps) {
	const [formData, setFormData] = useState<DischargeFormData>({
		patientId: "",
		appointmentId: undefined,
		dischargeDate: new Date().toISOString().split("T")[0] || "",
		dischargeDiagnosis: "",
		treatmentProvided: "",
		followUpInstructions: "",
		medications: "",
		restrictions: "",
	});
	const [discharge, setDischarge] = useState<Date | undefined>(undefined);
	const [patientError, setPatientError] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.patientId) {
			setPatientError("Please select a patient");
			return;
		}

		setPatientError("");

		const date = discharge ?? toDate(formData.dischargeDate) ?? undefined;
		const iso = date ? new Date(date).toISOString() : formData.dischargeDate;
		onSubmit?.({ ...formData, dischargeDate: iso });
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>Discharge Summary</CardTitle>
					<CardDescription>Complete patient discharge details and post-care guidance.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="patient">Patient</Label>
							<Select
								onValueChange={(value) => {
									setFormData({ ...formData, patientId: value });
									setPatientError("");
								}}
								value={formData.patientId}
							>
								<SelectTrigger className={patientError ? "border-red-500" : ""} id="patient">
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
							{patientError && <p className="font-medium text-red-500 text-sm">{patientError}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="appointment">Appointment (Optional)</Label>
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
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="dischargeDate">Discharge Date</Label>
							<DatePicker id="dischargeDate" onChange={setDischarge} value={discharge} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="dischargeDiagnosis">Discharge Diagnosis</Label>
							<Input
								id="dischargeDiagnosis"
								onChange={(e) => setFormData({ ...formData, dischargeDiagnosis: e.target.value })}
								placeholder="Final diagnosis at discharge..."
								required
								value={formData.dischargeDiagnosis}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="treatmentProvided">Treatment Provided</Label>
						<Textarea
							id="treatmentProvided"
							onChange={(e) => setFormData({ ...formData, treatmentProvided: e.target.value })}
							placeholder="Summary of treatment and procedures..."
							required
							value={formData.treatmentProvided}
						/>
					</div>

					<div className="space-y-4">
						<h4 className="font-medium">Post-Discharge Instructions</h4>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="followUpInstructions">Follow-Up Instructions (Optional)</Label>
								<Textarea
									id="followUpInstructions"
									onChange={(e) => setFormData({ ...formData, followUpInstructions: e.target.value })}
									placeholder="Follow-up appointments, when to seek care..."
									value={formData.followUpInstructions}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="medications">Medications (Optional)</Label>
								<Textarea
									id="medications"
									onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
									placeholder="List of discharge medications..."
									value={formData.medications}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="restrictions">Activity Restrictions (Optional)</Label>
							<Textarea
								id="restrictions"
								onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
								placeholder="Physical activity limitations, diet restrictions..."
								value={formData.restrictions}
							/>
						</div>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					{onCancel && (
						<Button onClick={onCancel} type="button" variant="outline">
							Cancel
						</Button>
					)}
					<Button type="submit">Create Discharge Summary</Button>
				</CardFooter>
			</Card>
		</form>
	);
}

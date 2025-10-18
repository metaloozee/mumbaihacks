"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type VitalSigns = {
	bloodPressure?: string;
	heartRate?: number;
	temperature?: number;
	respiratoryRate?: number;
	oxygenSaturation?: number;
	weight?: number;
	height?: number;
};

type AssessmentFormData = {
	patientId: string;
	appointmentId?: string;
	chiefComplaint: string;
	vitalSigns?: VitalSigns;
	assessmentNotes?: string;
};

type AssessmentFormProps = {
	onSubmit?: (data: AssessmentFormData) => void;
	onCancel?: () => void;
	patients?: Array<{ id: string; name: string }>;
	appointments?: Array<{ id: string; patientName: string; date: string }>;
};

export function AssessmentForm({ onSubmit, onCancel, patients = [], appointments = [] }: AssessmentFormProps) {
	const [formData, setFormData] = useState<AssessmentFormData>({
		patientId: "",
		appointmentId: undefined,
		chiefComplaint: "",
		vitalSigns: {},
		assessmentNotes: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit?.(formData);
	};

	const updateVitalSign = (key: keyof VitalSigns, value: string | number | undefined) => {
		setFormData({
			...formData,
			vitalSigns: {
				...formData.vitalSigns,
				[key]: value,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>New Assessment</CardTitle>
					<CardDescription>Capture patient complaint, vital signs, and clinical notes.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

					<div className="space-y-2">
						<Label htmlFor="chiefComplaint">Chief Complaint</Label>
						<Input
							id="chiefComplaint"
							onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
							placeholder="Patient's main concern or reason for visit"
							required
							value={formData.chiefComplaint}
						/>
					</div>

					<div className="space-y-4">
						<h4 className="font-medium">Vital Signs</h4>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="bloodPressure">Blood Pressure</Label>
								<Input
									id="bloodPressure"
									onChange={(e) => updateVitalSign("bloodPressure", e.target.value)}
									placeholder="120/80"
									value={formData.vitalSigns?.bloodPressure ?? ""}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="heartRate">Heart Rate (bpm)</Label>
								<Input
									id="heartRate"
									min="0"
									onChange={(e) =>
										updateVitalSign(
											"heartRate",
											e.target.value === "" ? undefined : Number(e.target.value)
										)
									}
									placeholder="72"
									type="number"
									value={formData.vitalSigns?.heartRate ?? ""}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="temperature">Temperature (°F)</Label>
								<Input
									id="temperature"
									onChange={(e) =>
										updateVitalSign(
											"temperature",
											e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
										)
									}
									placeholder="98.6"
									step="0.1"
									type="number"
									value={formData.vitalSigns?.temperature ?? ""}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
							<div className="space-y-2">
								<Label htmlFor="respiratoryRate">Resp. Rate</Label>
								<Input
									id="respiratoryRate"
									min="0"
									onChange={(e) =>
										updateVitalSign(
											"respiratoryRate",
											e.target.value === "" ? undefined : Number(e.target.value)
										)
									}
									placeholder="16"
									type="number"
									value={formData.vitalSigns?.respiratoryRate ?? ""}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="oxygenSaturation">O2 Sat (%)</Label>
								<Input
									id="oxygenSaturation"
									max="100"
									min="0"
									onChange={(e) =>
										updateVitalSign(
											"oxygenSaturation",
											e.target.value === "" ? undefined : Number(e.target.value)
										)
									}
									placeholder="98"
									type="number"
									value={formData.vitalSigns?.oxygenSaturation ?? ""}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="weight">Weight (lbs)</Label>
								<Input
									id="weight"
									min="0"
									onChange={(e) =>
										updateVitalSign(
											"weight",
											e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
										)
									}
									placeholder="150"
									step="0.1"
									type="number"
									value={formData.vitalSigns?.weight ?? ""}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="height">Height (in)</Label>
								<Input
									id="height"
									min="0"
									onChange={(e) =>
										updateVitalSign(
											"height",
											e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
										)
									}
									placeholder="68"
									step="0.1"
									type="number"
									value={formData.vitalSigns?.height ?? ""}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="assessmentNotes">Assessment Notes (Optional)</Label>
						<Textarea
							id="assessmentNotes"
							onChange={(e) => setFormData({ ...formData, assessmentNotes: e.target.value })}
							placeholder="Additional clinical notes and observations..."
							value={formData.assessmentNotes ?? ""}
						/>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					{onCancel && (
						<Button onClick={onCancel} type="button" variant="outline">
							Cancel
						</Button>
					)}
					<Button type="submit">Create Assessment</Button>
				</CardFooter>
			</Card>
		</form>
	);
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toDate } from "@/lib/date-utils";

type OnboardingFormData = {
	dateOfBirth: string;
	gender: string;
	phone: string;
	address: string;
	emergencyContactName: string;
	emergencyContactPhone: string;
	bloodType: string;
	preferredLanguage: string;
	occupation: string;
	maritalStatus: string;
};

type OnboardingFormProps = {
	onSubmit?: (data: OnboardingFormData) => void;
	onCancel?: () => void;
};

export function OnboardingForm({ onSubmit, onCancel }: OnboardingFormProps) {
	const [formData, setFormData] = useState<OnboardingFormData>({
		dateOfBirth: "",
		gender: "",
		phone: "",
		address: "",
		emergencyContactName: "",
		emergencyContactPhone: "",
		bloodType: "",
		preferredLanguage: "English",
		occupation: "",
		maritalStatus: "",
	});
	const [dob, setDob] = useState<Date | undefined>(undefined);
	const [dobError, setDobError] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const date = dob ?? toDate(formData.dateOfBirth) ?? undefined;
		if (!date) {
			setDobError("Date of Birth is required");
			return;
		}

		setDobError("");

		const iso = new Date(date).toISOString();
		onSubmit?.({ ...formData, dateOfBirth: iso });
	};

	const handleDobChange = (date: Date | undefined) => {
		setDob(date);
		if (date) {
			setDobError("");
		}
	};

	const isFormValid = !!(dob ?? toDate(formData.dateOfBirth));

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>Patient Onboarding</CardTitle>
					<CardDescription>Provide personal, contact, and medical background information.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<h3 className="font-medium text-lg">Personal Information</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="dateOfBirth">
									Date of Birth <span className="text-destructive">*</span>
								</Label>
								<DatePicker id="dateOfBirth" onChange={handleDobChange} value={dob} />
								{dobError && <p className="text-destructive text-sm">{dobError}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="gender">Gender</Label>
								<Select
									onValueChange={(value) => setFormData({ ...formData, gender: value })}
									value={formData.gender}
								>
									<SelectTrigger id="gender">
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Male</SelectItem>
										<SelectItem value="female">Female</SelectItem>
										<SelectItem value="other">Other</SelectItem>
										<SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									placeholder="+1 (555) 000-0000"
									required
									type="tel"
									value={formData.phone}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="preferredLanguage">Preferred Language</Label>
								<Select
									onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value })}
									value={formData.preferredLanguage}
								>
									<SelectTrigger id="preferredLanguage">
										<SelectValue placeholder="Select language" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="English">English</SelectItem>
										<SelectItem value="Spanish">Spanish</SelectItem>
										<SelectItem value="French">French</SelectItem>
										<SelectItem value="German">German</SelectItem>
										<SelectItem value="Hindi">Hindi</SelectItem>
										<SelectItem value="Other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">Address</Label>
							<Input
								id="address"
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								placeholder="Street address, City, State, ZIP"
								required
								value={formData.address}
							/>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="font-medium text-lg">Emergency Contact</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="emergencyContactName">Contact Name</Label>
								<Input
									id="emergencyContactName"
									onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
									placeholder="Full name"
									required
									value={formData.emergencyContactName}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="emergencyContactPhone">Contact Phone</Label>
								<Input
									id="emergencyContactPhone"
									onChange={(e) =>
										setFormData({ ...formData, emergencyContactPhone: e.target.value })
									}
									placeholder="+1 (555) 000-0000"
									required
									type="tel"
									value={formData.emergencyContactPhone}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="font-medium text-lg">Medical & Social Information</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="bloodType">Blood Type (Optional)</Label>
								<Select
									onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
									value={formData.bloodType}
								>
									<SelectTrigger id="bloodType">
										<SelectValue placeholder="Select blood type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="A+">A+</SelectItem>
										<SelectItem value="A-">A-</SelectItem>
										<SelectItem value="B+">B+</SelectItem>
										<SelectItem value="B-">B-</SelectItem>
										<SelectItem value="AB+">AB+</SelectItem>
										<SelectItem value="AB-">AB-</SelectItem>
										<SelectItem value="O+">O+</SelectItem>
										<SelectItem value="O-">O-</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="maritalStatus">Marital Status (Optional)</Label>
								<Select
									onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
									value={formData.maritalStatus}
								>
									<SelectTrigger id="maritalStatus">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="single">Single</SelectItem>
										<SelectItem value="married">Married</SelectItem>
										<SelectItem value="divorced">Divorced</SelectItem>
										<SelectItem value="widowed">Widowed</SelectItem>
										<SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="occupation">Occupation (Optional)</Label>
							<Input
								id="occupation"
								onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
								placeholder="Your occupation"
								value={formData.occupation}
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
					<Button disabled={!isFormValid} type="submit">
						Complete Onboarding
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}

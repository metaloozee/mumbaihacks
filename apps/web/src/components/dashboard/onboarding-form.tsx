"use client";

import { Loader2 } from "lucide-react";
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
	insuranceProvider: string;
	insurancePolicyNumber: string;
	insuranceProviderWebsite: string;
	insuranceClaimFormUrl: string;
};

type OnboardingFormProps = {
	onSubmit?: (data: OnboardingFormData) => void;
	onCancel?: () => void;
	isLoading?: boolean;
};

export function OnboardingForm({ onSubmit, onCancel, isLoading = false }: OnboardingFormProps) {
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
		insuranceProvider: "",
		insurancePolicyNumber: "",
		insuranceProviderWebsite: "",
		insuranceClaimFormUrl: "",
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

	const isFormValid = !!(dob ?? toDate(formData.dateOfBirth)) && !!formData.gender;

	return (
		<form onSubmit={handleSubmit}>
			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle>Patient Onboarding</CardTitle>
					<CardDescription>
						Provide personal, contact, and medical background information to tailor your care.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-8">
					<fieldset className="space-y-4">
						<legend className="sr-only">Personal Information</legend>
						<h3 className="font-semibold text-lg">Personal Information</h3>
						<p className="text-muted-foreground text-sm">
							We use this to confirm your identity and personalize your experience.
						</p>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="dateOfBirth">
									Date of Birth <span className="text-destructive">*</span>
								</Label>
								<DatePicker
									aria-describedby={dobError ? "dob-error" : undefined}
									buttonClassName={isLoading ? "opacity-50 cursor-not-allowed" : ""}
									fromYear={1920}
									id="dateOfBirth"
									onChange={handleDobChange}
									placeholder="Select your date of birth"
									toYear={new Date().getFullYear()}
									value={dob}
								/>
								{dobError && (
									<p className="text-destructive text-sm" id="dob-error" role="alert">
										{dobError}
									</p>
								)}
							</div>{" "}
							<div className="space-y-2">
								<Label htmlFor="gender">
									Gender <span className="text-destructive">*</span>
								</Label>
								<Select
									disabled={isLoading}
									onValueChange={(value) => setFormData({ ...formData, gender: value })}
									required
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
						</div>{" "}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="phone">
									Phone Number <span className="text-destructive">*</span>
								</Label>
								<Input
									autoComplete="tel"
									disabled={isLoading}
									id="phone"
									inputMode="tel"
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									placeholder="+1 (555) 000-0000"
									required
									type="tel"
									value={formData.phone}
								/>
								<p className="text-muted-foreground text-xs">
									We’ll only use this for important updates.
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="preferredLanguage">Preferred Language</Label>
								<Select
									disabled={isLoading}
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
							<Label htmlFor="address">
								Address <span className="text-destructive">*</span>
							</Label>
							<Input
								autoComplete="street-address"
								disabled={isLoading}
								id="address"
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								placeholder="Street address, City, State, ZIP"
								required
								value={formData.address}
							/>
						</div>
					</fieldset>

					<hr className="border-border/60" />

					<fieldset className="space-y-4">
						<legend className="sr-only">Emergency Contact</legend>
						<h3 className="font-semibold text-lg">Emergency Contact</h3>
						<p className="text-muted-foreground text-sm">
							We’ll reach out to this person in case of an emergency.
						</p>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="emergencyContactName">
									Contact Name <span className="text-destructive">*</span>
								</Label>
								<Input
									autoComplete="name"
									disabled={isLoading}
									id="emergencyContactName"
									onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
									placeholder="Full name"
									required
									value={formData.emergencyContactName}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="emergencyContactPhone">
									Contact Phone <span className="text-destructive">*</span>
								</Label>
								<Input
									autoComplete="tel"
									disabled={isLoading}
									id="emergencyContactPhone"
									inputMode="tel"
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
					</fieldset>

					<hr className="border-border/60" />

					<fieldset className="space-y-4">
						<legend className="sr-only">Medical and Social Information</legend>
						<h3 className="font-semibold text-lg">Medical & Social Information</h3>
						<p className="text-muted-foreground text-sm">
							These details help clinicians understand your background. All fields here are optional.
						</p>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="bloodType">Blood Type (Optional)</Label>
								<Select
									disabled={isLoading}
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
									disabled={isLoading}
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
								disabled={isLoading}
								id="occupation"
								onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
								placeholder="Your occupation"
								value={formData.occupation}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="insuranceProvider">Insurance Provider (Optional)</Label>
								<Input
									disabled={isLoading}
									id="insuranceProvider"
									onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
									placeholder="Your insurance provider"
									value={formData.insuranceProvider}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="insurancePolicyNumber">Insurance Policy Number (Optional)</Label>
								<Input
									disabled={isLoading}
									id="insurancePolicyNumber"
									onChange={(e) =>
										setFormData({ ...formData, insurancePolicyNumber: e.target.value })
									}
									placeholder="Policy number"
									value={formData.insurancePolicyNumber}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="insuranceProviderWebsite">Insurance Provider Website (Optional)</Label>
								<Input
									disabled={isLoading}
									id="insuranceProviderWebsite"
									onChange={(e) =>
										setFormData({ ...formData, insuranceProviderWebsite: e.target.value })
									}
									placeholder="https://example.com"
									type="url"
									value={formData.insuranceProviderWebsite}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="insuranceClaimFormUrl">Insurance Claim Form URL (Optional)</Label>
								<Input
									disabled={isLoading}
									id="insuranceClaimFormUrl"
									onChange={(e) =>
										setFormData({ ...formData, insuranceClaimFormUrl: e.target.value })
									}
									placeholder="https://example.com/claim-form"
									type="url"
									value={formData.insuranceClaimFormUrl}
								/>
							</div>
						</div>
					</fieldset>
				</CardContent>
				<CardFooter className="justify-end gap-2 border-t bg-card/40 py-4">
					{onCancel && (
						<Button disabled={isLoading} onClick={onCancel} type="button" variant="outline">
							Cancel
						</Button>
					)}
					<Button disabled={!isFormValid || isLoading} type="submit">
						{isLoading ? (
							<>
								<Loader2 className="animate-spin" />
								Submitting...
							</>
						) : (
							"Complete Onboarding"
						)}
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}

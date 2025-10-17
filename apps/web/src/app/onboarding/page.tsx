"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";
import { trpcClient } from "@/utils/trpc";

export default function OnboardingPage() {
	const router = useRouter();

	const createDemographics = useMutation({
		mutationFn: (data: Parameters<typeof trpcClient.patients.createDemographics.mutate>[0]) =>
			trpcClient.patients.createDemographics.mutate(data),
		onSuccess: () => {
			toast.success("Onboarding completed successfully!");
			router.push("/dashboard");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to complete onboarding");
		},
	});

	const handleSubmit = (data: {
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
	}) => {
		createDemographics.mutate(data);
	};

	return (
		<main className="container mx-auto max-w-4xl py-10">
			<div className="mb-8">
				<h1 className="font-bold text-3xl">Welcome! Complete Your Profile</h1>
				<p className="mt-2 text-muted-foreground">
					Please provide some information to help us serve you better.
				</p>
			</div>

			<div className="rounded-lg border bg-card p-6">
				<OnboardingForm onSubmit={handleSubmit} />
			</div>
		</main>
	);
}

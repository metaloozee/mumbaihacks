"use client";

import { useQuery } from "@tanstack/react-query";
import { LandingCta } from "@/components/landing/cta";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { UseCases } from "@/components/landing/use-cases";
import PatternBackground from "@/components/pattern";
import { trpc } from "@/utils/trpc";

export default function Home() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const isLoading = healthCheck.isLoading;
	const isConnected = Boolean(healthCheck.data);

	let dotClass = "bg-red-500";
	let heroStatusText = "API: Disconnected";
	if (isLoading) {
		dotClass = "bg-yellow-500";
		heroStatusText = "Checking API...";
	} else if (isConnected) {
		dotClass = "bg-green-500";
		heroStatusText = "API: Connected";
	}

	return (
		<PatternBackground>
			<main>
				<Hero dotClass={dotClass} statusText={heroStatusText} />
				<ProductShowcase />
				<FeatureGrid />
				<UseCases />
				<LandingCta />
			</main>
		</PatternBackground>
	);
}

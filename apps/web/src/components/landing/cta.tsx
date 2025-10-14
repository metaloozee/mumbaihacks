"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LandingCta() {
	return (
		<section className="container mx-auto max-w-6xl px-4 pb-20">
			<Card className="inset-5 border-5 border-primary bg-background">
				<CardContent className="flex flex-col items-center justify-between gap-4 p-8 text-center md:flex-row md:text-left">
					<div>
						<h3 className="text-balance font-semibold text-2xl tracking-tight">
							Start building the future of hospital EHR
						</h3>
						<p className="mt-2 text-muted-foreground">Ship an AI‑first experience in days, not months.</p>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<Button asChild size="lg">
							<Link href="/login">Get started</Link>
						</Button>
						<Button asChild size="lg" variant="secondary">
							<Link href="/dashboard">View dashboard</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}

export default LandingCta;

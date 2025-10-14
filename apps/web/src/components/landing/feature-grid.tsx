"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EASE_OUT_BACK_X = 0.16;
const EASE_OUT_BACK_Y = 1;
const EASE_OUT_BACK_Z = 0.3;
const EASE_OUT_BACK_W = 1;
const ANIM_EASE = [EASE_OUT_BACK_X, EASE_OUT_BACK_Y, EASE_OUT_BACK_Z, EASE_OUT_BACK_W] as const;
const ANIM_DURATION_CARD = 0.6;
const DELAY_STEP = 0.06;
const VIEWPORT_MARGIN = "-80px";

const FEATURES: { title: string; description: string }[] = [
	{
		title: "AI‑assisted charting",
		description: "Draft notes, summarize visits, and extract structured data to EHR fields.",
	},
	{
		title: "Unified EHR",
		description: "Appointments, records, and prescriptions linked by patient & clinician.",
	},
	{
		title: "Smart appointments",
		description: "Conflict checks, status updates, and reminders out of the box.",
	},
	{
		title: "e‑Prescriptions",
		description: "Validation, expiry handling, and refills with full audit history.",
	},
	{
		title: "Role‑based access",
		description: "Admin, clinician, and patient experiences with granular permissions.",
	},
	{
		title: "Analytics & exports",
		description: "Trends and outcomes with CSV/PDF export support.",
	},
];

export function FeatureGrid() {
	return (
		<section className="container mx-auto max-w-6xl px-4 pb-16">
			<div className="grid gap-6 md:grid-cols-3">
				{FEATURES.map((f, i) => (
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						key={f.title}
						transition={{ duration: ANIM_DURATION_CARD, ease: ANIM_EASE, delay: i * DELAY_STEP }}
						viewport={{ once: true, margin: VIEWPORT_MARGIN }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<Card>
							<CardHeader>
								<CardTitle>{f.title}</CardTitle>
								<CardDescription>{f.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">
									Built for hospitals and multi‑clinic systems.
								</p>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	);
}

export default FeatureGrid;

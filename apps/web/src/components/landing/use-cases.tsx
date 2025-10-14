"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EASE_OUT_BACK_X = 0.16;
const EASE_OUT_BACK_Y = 1;
const EASE_OUT_BACK_Z = 0.3;
const EASE_OUT_BACK_W = 1;
const ANIM_EASE = [EASE_OUT_BACK_X, EASE_OUT_BACK_Y, EASE_OUT_BACK_Z, EASE_OUT_BACK_W] as const;
const VIEWPORT_MARGIN = "-80px";

export function UseCases() {
	return (
		<section className="container mx-auto max-w-6xl px-4 pb-16">
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				transition={{ duration: 0.6, ease: ANIM_EASE }}
				viewport={{ once: true, margin: VIEWPORT_MARGIN }}
				whileInView={{ opacity: 1, y: 0 }}
			>
				<div className="mx-auto mb-8 max-w-3xl text-center">
					<h2 className="text-balance font-semibold text-3xl tracking-tight">
						Collaborate, work, and play live
					</h2>
					<p className="mt-2 text-muted-foreground">
						Streamline clinician–patient relationships with shared context, secure access, and complete
						audit trails from appointment to prescription.
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Clinicians</CardTitle>
							<CardDescription>Chart faster, prescribe safely, and track outcomes.</CardDescription>
						</CardHeader>
						<CardContent className="text-muted-foreground text-sm">
							AI‑assisted notes, quick order sets, and appointment views.
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Patients</CardTitle>
							<CardDescription>See prescriptions, upcoming visits, and records.</CardDescription>
						</CardHeader>
						<CardContent className="text-muted-foreground text-sm">
							Secure portal with reminders and easy follow‑ups.
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Admins</CardTitle>
							<CardDescription>Control access, audit changes, and run reports.</CardDescription>
						</CardHeader>
						<CardContent className="text-muted-foreground text-sm">
							RBAC, audit logs, analytics, and exports to CSV/PDF.
						</CardContent>
					</Card>
				</div>
			</motion.div>
		</section>
	);
}

export default UseCases;

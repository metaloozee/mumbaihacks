"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EASE_OUT_BACK_X = 0.16;
const EASE_OUT_BACK_Y = 1;
const EASE_OUT_BACK_Z = 0.3;
const EASE_OUT_BACK_W = 1;
const ANIM_EASE = [EASE_OUT_BACK_X, EASE_OUT_BACK_Y, EASE_OUT_BACK_Z, EASE_OUT_BACK_W] as const;
const VIEWPORT_MARGIN = "-80px";

export function DevSection() {
	return (
		<section className="container mx-auto max-w-6xl px-4 pb-16">
			<div className="mx-auto mb-8 max-w-3xl text-center">
				<h2 className="text-balance font-semibold text-3xl tracking-tight">Any platform, any device</h2>
				<p className="mt-2 text-muted-foreground">
					API‑first with end‑to‑end types using tRPC, Drizzle ORM, and React Query. Built on Next.js App
					Router. Packages: api, db, auth.
				</p>
			</div>
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				transition={{ duration: 0.6, ease: ANIM_EASE }}
				viewport={{ once: true, margin: VIEWPORT_MARGIN }}
				whileInView={{ opacity: 1, y: 0 }}
			>
				<div className="grid gap-6 md:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Type‑safe APIs</CardTitle>
							<CardDescription>tRPC routers shared across client and server.</CardDescription>
						</CardHeader>
						<CardContent className="text-muted-foreground text-sm">Autocomplete from DB to UI.</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Data layer</CardTitle>
							<CardDescription>Drizzle schemas and migrations for healthcare.</CardDescription>
						</CardHeader>
						<CardContent className="text-muted-foreground text-sm">
							Strong constraints, safe queries.
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Auth ready</CardTitle>
							<CardDescription>Session handling and role‑based access.</CardDescription>
						</CardHeader>
						<CardContent className="text-muted-foreground text-sm">
							2FA roadmap included in TODOs.
						</CardContent>
					</Card>
				</div>
			</motion.div>
		</section>
	);
}

export default DevSection;

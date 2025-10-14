"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EASE_OUT_BACK_X = 0.16;
const EASE_OUT_BACK_Y = 1;
const EASE_OUT_BACK_Z = 0.3;
const EASE_OUT_BACK_W = 1;
const ANIM_EASE = [EASE_OUT_BACK_X, EASE_OUT_BACK_Y, EASE_OUT_BACK_Z, EASE_OUT_BACK_W] as const;
// const ANIM_DURATION_FADE = 0.7;
const ANIM_DURATION_SECTION = 0.8;
const ANIM_DELAY_HERO = 0.04;
const OFFSET_Y = 8;

export type HeroProps = {
	statusText: string;
	dotClass: string;
};

export function Hero({ statusText, dotClass }: HeroProps) {
	const heroWrapperClass = "max-w-3xl mx-auto text-center";

	return (
		<section className="container mx-auto max-w-5xl px-4 py-14">
			<div className="relative">
				{/* Background accent
				<div className="-z-10 pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						animate={{ opacity: 1 }}
						className="mx-auto h-[300px] w-[700px] max-w-[85vw] rounded-full bg-primary/15 blur-3xl"
						initial={{ opacity: 0 }}
						transition={{ duration: ANIM_DURATION_FADE, ease: ANIM_EASE }}
					/>
				</div> */}

				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className={heroWrapperClass}
					initial={{ opacity: 0, y: OFFSET_Y }}
					transition={{
						duration: ANIM_DURATION_SECTION,
						ease: ANIM_EASE,
						delay: ANIM_DELAY_HERO,
					}}
				>
					<p className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-muted-foreground text-xs">
						<span className={`h-2 w-2 rounded-full ${dotClass}`} />
						{statusText}
					</p>
					<h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-5xl">
						Build an AI-first EHR your clinicians love
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
						Appointments, medical records, and e‑prescriptions powered by secure, type‑safe APIs and
						AI‑assisted charting. Designed for hospitals to streamline clinician–patient workflows.
					</p>
					<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
						<Button asChild size="lg">
							<Link href="/login">Get started</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<Link href="/dashboard">View dashboard</Link>
						</Button>
					</div>
				</motion.div>
			</div>
		</section>
	);
}

export default Hero;

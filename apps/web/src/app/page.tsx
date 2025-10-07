"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

const EASE_OUT_BACK_X = 0.16;
const EASE_OUT_BACK_Y = 1;
const EASE_OUT_BACK_Z = 0.3;
const EASE_OUT_BACK_W = 1;
const ANIM_EASE = [
  EASE_OUT_BACK_X,
  EASE_OUT_BACK_Y,
  EASE_OUT_BACK_Z,
  EASE_OUT_BACK_W,
] as const;
const ANIM_DURATION_FADE = 0.7;
const ANIM_DURATION_SECTION = 0.8;
const ANIM_DURATION_CARD = 0.6;
const ANIM_DELAY_HERO = 0.04;
const ANIM_DELAY_CARD_1 = 0.06;
const ANIM_DELAY_CARD_2 = 0.12;
const ANIM_DELAY_CARD_3 = 0.18;
const VIEWPORT_MARGIN = "-80px";
const OFFSET_Y = 8;

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const isLoading = healthCheck.isLoading;
  const isConnected = Boolean(healthCheck.data);

  let dotClass = "bg-red-500";
  let heroStatusText = "API: Disconnected";
  let badgeBorderClass = "border-red-500/30 text-red-600";
  let statusShortText = "Disconnected";
  if (isLoading) {
    dotClass = "bg-yellow-500";
    heroStatusText = "Checking API...";
    badgeBorderClass = "border-yellow-500/30 text-yellow-600";
    statusShortText = "Checking";
  } else if (isConnected) {
    dotClass = "bg-green-500";
    heroStatusText = "API: Connected";
    badgeBorderClass = "border-green-500/30 text-green-600";
    statusShortText = "Connected";
  }
  const heroWrapperClass = "max-w-3xl mx-auto text-center";

  return (
    <main className="relative">
      {/* Background accent */}
      <div className="-z-10 pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: 1 }}
          className="mx-auto h-[300px] w-[700px] max-w-[85vw] rounded-full bg-primary/15 blur-3xl"
          initial={{ opacity: 0 }}
          transition={{ duration: ANIM_DURATION_FADE, ease: ANIM_EASE }}
        />
      </div>

      {/* Hero */}
      <section className="container mx-auto max-w-5xl px-4 py-14">
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
            {heroStatusText}
          </p>
          <h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-5xl">
            Ship a SaaS faster with a modern starter
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Authentication, API, and UI primitives wired up so you can focus on
            your product. Minimal UI, delightful DX.
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
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: OFFSET_Y }}
            transition={{
              duration: ANIM_DURATION_CARD,
              ease: ANIM_EASE,
              delay: ANIM_DELAY_CARD_1,
            }}
            viewport={{ once: true, margin: VIEWPORT_MARGIN }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Type-safe API</CardTitle>
                <CardDescription>
                  End-to-end types with tRPC and strict TS rules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Move fast without breaking types. Autocomplete from server to
                  client.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: OFFSET_Y }}
            transition={{
              duration: ANIM_DURATION_CARD,
              ease: ANIM_EASE,
              delay: ANIM_DELAY_CARD_2,
            }}
            viewport={{ once: true, margin: VIEWPORT_MARGIN }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Auth built-in</CardTitle>
                <CardDescription>
                  Sign up, sign in, and session handling done.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Production-grade primitives with sensible defaults out of the
                  box.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: OFFSET_Y }}
            transition={{
              duration: ANIM_DURATION_CARD,
              ease: ANIM_EASE,
              delay: ANIM_DELAY_CARD_3,
            }}
            viewport={{ once: true, margin: VIEWPORT_MARGIN }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Accessible UI</CardTitle>
                <CardDescription>
                  Prebuilt components with a11y and theming.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Clean, minimal, and responsive. Dark mode supported by
                  default.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Status section */}
      <section className="container mx-auto max-w-5xl px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          transition={{ duration: ANIM_DURATION_CARD, ease: ANIM_EASE }}
          viewport={{ once: true, margin: VIEWPORT_MARGIN }}
          whileInView={{ opacity: 1 }}
        >
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Environment status</CardTitle>
                <CardDescription>
                  Quick glance at your connected services.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">API</span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${badgeBorderClass}`}
                >
                  <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                  {statusShortText}
                </span>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}

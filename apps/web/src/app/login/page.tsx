import { MoveLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";

export default function Page() {
	return (
		<main className="my-10 grid min-h-dvh place-items-center px-4">
			<div className="w-full max-w-md">
				<div className="mb-6">
					<Button aria-label="Go back to landing page" asChild size={"sm"} variant="outline">
						<Link className="text-xs" href="/">
							<MoveLeftIcon /> Back
						</Link>
					</Button>
				</div>

				<header className="mb-4">
					<h1 className="text-pretty font-semibold text-2xl tracking-tight">{"MedFlow"}</h1>
					<p className="text-muted-foreground text-sm">
						{"Smart, AI-powered digital services for healthcare."}
					</p>
				</header>

				<Suspense fallback={<div className="text-muted-foreground text-sm">{"Loading…"}</div>}>
					<LoginForm />
				</Suspense>
			</div>
		</main>
	);
}

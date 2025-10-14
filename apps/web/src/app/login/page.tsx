import { MoveLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/login-form";
import { Button } from "@/components/ui/button";

export default function Page() {
	return (
		<main className="grid place-items-center px-4">
			<div className="w-full max-w-md">
				<div className="mb-6">
					<Button aria-label="Go back to landing page" asChild size={"sm"} variant="outline">
						<Link className="text-xs" href="/">
							<MoveLeftIcon /> Back
						</Link>
					</Button>
				</div>

				<Suspense fallback={<div className="text-muted-foreground text-sm">{"Loading…"}</div>}>
					<LoginForm />
				</Suspense>
			</div>
		</main>
	);
}

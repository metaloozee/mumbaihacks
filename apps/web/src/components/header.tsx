"use client";
import { PillIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const { data: session, isPending } = authClient.useSession();

	const showAuthButtons = Boolean(!(session || isPending));

	return (
		<header className="sticky top-0 z-50 border-border border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
				<div className="flex items-center gap-3">
					<Link className="flex items-center gap-2" href="/">
						<PillIcon className="size-4" />
						<span className="font-semibold tracking-tight">MedFlow</span>
					</Link>
				</div>

				<div className="hidden items-center gap-6 md:flex">
					<Link className="text-muted-foreground text-sm transition-colors hover:text-foreground" href="/">
						Home
					</Link>
					<Link
						className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						href="/#features"
					>
						Features
					</Link>
					<Link
						className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						href="/dashboard"
					>
						Dashboard
					</Link>
				</div>

				<div className="flex items-center gap-2">
					{showAuthButtons ? (
						<>
							<Button asChild variant="ghost">
								<Link href="/login">Log in</Link>
							</Button>
							<Button asChild className="bg-primary text-primary-foreground">
								<Link href="/login">Get started</Link>
							</Button>
						</>
					) : (
						<>
							<ModeToggle />
							<UserMenu />
						</>
					)}
				</div>
			</nav>
		</header>
	);
}

"use client";
import { Menu, PillIcon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const { data: session, isPending } = authClient.useSession();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const showAuthButtons = Boolean(!(session || isPending));

	// Close mobile menu on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && mobileMenuOpen) {
				setMobileMenuOpen(false);
			}
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [mobileMenuOpen]);

	// Close mobile menu when a link is clicked
	const handleLinkClick = () => {
		setMobileMenuOpen(false);
	};

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
							<Button asChild className="hidden md:inline-flex" variant="ghost">
								<Link href="/login">Log in</Link>
							</Button>
							<Button asChild className="hidden bg-primary text-primary-foreground md:inline-flex">
								<Link href="/login?state=sign-up">Get started</Link>
							</Button>
						</>
					) : (
						<>
							<ModeToggle />
							<UserMenu />
						</>
					)}

					<Button
						aria-expanded={mobileMenuOpen}
						aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
						className="md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						size="icon"
						variant="ghost"
					>
						{mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</Button>
				</div>
			</nav>

			{/* Mobile menu panel */}
			{mobileMenuOpen && (
				<div className="border-border border-t bg-background md:hidden">
					<nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-4">
						<div className="flex flex-col gap-4">
							<Link
								className="text-foreground text-sm transition-colors hover:text-primary"
								href="/"
								onClick={handleLinkClick}
							>
								Home
							</Link>
							<Link
								className="text-foreground text-sm transition-colors hover:text-primary"
								href="/#features"
								onClick={handleLinkClick}
							>
								Features
							</Link>
							<Link
								className="text-foreground text-sm transition-colors hover:text-primary"
								href="/dashboard"
								onClick={handleLinkClick}
							>
								Dashboard
							</Link>

							{showAuthButtons && (
								<div className="flex flex-col gap-2 pt-2">
									<Button asChild onClick={handleLinkClick} variant="ghost">
										<Link href="/login">Log in</Link>
									</Button>
									<Button
										asChild
										className="bg-primary text-primary-foreground"
										onClick={handleLinkClick}
									>
										<Link href="/login?state=sign-up">Get started</Link>
									</Button>
								</div>
							)}
						</div>
					</nav>
				</div>
			)}
		</header>
	);
}

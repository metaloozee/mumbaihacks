"use client";

import { Google } from "@lobehub/icons";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { parseAsStringEnum, useQueryState } from "nuqs";
import * as React from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

export default function LoginForm() {
	const router = useRouter();
	const [mode, setMode] = useQueryState("state", parseAsStringEnum(["sign-in", "sign-up"]).withDefault("sign-in"));
	const [loading, setLoading] = React.useState<"google" | "email" | null>(null);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setLoading("email");
			try {
				if (mode === "sign-up") {
					await authClient.signUp.email(
						{
							email: value.email,
							password: value.password,
							name: value.name,
						},
						{
							onSuccess: () => {
								router.push("/dashboard");
								toast.success("Account created successfully");
							},
							onError: (error) => {
								toast.error(error?.error?.message ?? error?.error?.statusText ?? "An error occurred");
							},
						}
					);
				} else {
					await authClient.signIn.email(
						{
							email: value.email,
							password: value.password,
						},
						{
							onSuccess: () => {
								router.push("/dashboard");
								toast.success("Sign in successful");
							},
							onError: (error) => {
								toast.error(error?.error?.message ?? error?.error?.statusText ?? "An error occurred");
							},
						}
					);
				}
			} finally {
				setLoading(null);
			}
		},
		validators: {
			onSubmit: ({ value }) => {
				const schema =
					mode === "sign-up"
						? z.object({
								name: z.string().min(2, "Name must be at least 2 characters"),
								email: z.string().email("Invalid email address"),
								password: z.string().min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters"),
							})
						: z.object({
								name: z.string().optional(),
								email: z.string().email("Invalid email address"),
								password: z.string().min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters"),
							});

				const result = schema.safeParse(value);
				if (!result.success) {
					return result.error.format();
				}
			},
		},
	});

	async function onGoogleSignIn() {
		setLoading("google");
		try {
			await authClient.signIn.social(
				{
					provider: "google",
					callbackURL: "/dashboard",
				},
				{
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				}
			);
		} finally {
			setLoading(null);
		}
	}

	const getGoogleButtonText = () => {
		if (loading === "google") {
			return mode === "sign-up" ? "Creating account…" : "Signing in…";
		}
		return "Continue with Google";
	};

	return (
		<Card className="border-0 bg-card shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">
					{mode === "sign-up" ? "Create your MedFlow account" : "Sign in to MedFlow"}
				</CardTitle>
				<CardDescription className="text-muted-foreground text-sm">
					{mode === "sign-up" ? "Get started in minutes" : "Choose a sign-in method"}
				</CardDescription>
			</CardHeader>

			<CardContent className="grid gap-4">
				<Button
					aria-label={mode === "sign-up" ? "Sign up with Google" : "Sign in with Google"}
					disabled={loading === "google"}
					onClick={onGoogleSignIn}
					variant="outline"
				>
					<Google />
					{getGoogleButtonText()}
				</Button>

				<div className="flex items-center gap-3">
					<div className="h-px w-full bg-border" />
					<span className="text-muted-foreground text-xs">{"or"}</span>
					<div className="h-px w-full bg-border" />
				</div>

				<form
					className="grid gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					{mode === "sign-up" && (
						<form.Field name="name">
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>{"Name"}</Label>
									<Input
										autoComplete="name"
										id={field.name}
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.currentTarget.value)}
										placeholder="John Doe"
										required
										type="text"
										value={field.state.value}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>
					)}

					<form.Field name="email">
						{(field) => (
							<div className="grid gap-2">
								<Label htmlFor={field.name}>{"Email"}</Label>
								<Input
									autoComplete="email"
									id={field.name}
									inputMode="email"
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.currentTarget.value)}
									placeholder="you@clinic.com"
									required
									type="email"
									value={field.state.value}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<div className="grid gap-2">
								<div className="flex items-center justify-between">
									<Label htmlFor={field.name}>
										{mode === "sign-up" ? "Create password" : "Password"}
									</Label>
									{mode === "sign-in" && (
										<button
											className="text-muted-foreground text-xs underline underline-offset-4 hover:text-foreground"
											onClick={(e) => {
												e.preventDefault();
												// TODO: Implement forgot password
											}}
											type="button"
										>
											{"Forgot?"}
										</button>
									)}
								</div>
								<Input
									autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
									id={field.name}
									minLength={MIN_PASSWORD_LENGTH}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.currentTarget.value)}
									required
									type="password"
									value={field.state.value}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Subscribe>
						{(state) => {
							let buttonText = "Sign in";
							if (loading === "email") {
								buttonText = mode === "sign-up" ? "Creating…" : "Signing in…";
							} else if (mode === "sign-up") {
								buttonText = "Create account";
							}

							return (
								<Button
									className="w-full"
									disabled={!state.canSubmit || loading === "email"}
									type="submit"
								>
									{buttonText}
								</Button>
							);
						}}
					</form.Subscribe>
				</form>
			</CardContent>

			<CardFooter className={cn("flex flex-col gap-3 pt-2")}>
				<p className="text-center text-muted-foreground text-sm">
					{mode === "sign-up" ? "Already have an account? " : "New to MedFlow? "}
					<button
						className="underline underline-offset-4 hover:text-foreground"
						onClick={() => setMode(mode === "sign-up" ? "sign-in" : "sign-up")}
						type="button"
					>
						{mode === "sign-up" ? "Sign in" : "Create an account"}
					</button>
				</p>

				<p className="text-muted-foreground text-xs leading-relaxed">
					{"By continuing, you agree to MedFlow's "}
					<button className="underline underline-offset-4 hover:text-foreground" type="button">
						{"Terms"}
					</button>
					{" and "}
					<button className="underline underline-offset-4 hover:text-foreground" type="button">
						{"Privacy Policy"}
					</button>
					{"."}
				</p>
			</CardFooter>
		</Card>
	);
}

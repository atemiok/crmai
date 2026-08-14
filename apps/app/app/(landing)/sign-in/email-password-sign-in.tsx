"use client";

import { authClient, signIn } from "@crm/auth/client";
import { Button } from "@crm/ui/components/button";
import { Input } from "@crm/ui/components/input";
import { Label } from "@crm/ui/components/label";
import { Spinner } from "@crm/ui/components/spinner";
import { useState } from "react";
import { toast } from "sonner";

export function EmailPasswordSignIn() {
	const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pending, setPending] = useState(false);

	function switchMode(nextMode: "sign-in" | "sign-up") {
		setMode(nextMode);
		setPassword("");
		setConfirmPassword("");
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const normalizedEmail = email.trim().toLowerCase();
		const normalizedName = name.trim();

		if (mode === "sign-up") {
			if (!normalizedName) {
				toast.error("Enter your name.");
				return;
			}

			if (password.length < 8) {
				toast.error("Password must be at least 8 characters.");
				return;
			}

			if (password !== confirmPassword) {
				toast.error("Passwords do not match.");
				return;
			}
		}

		setPending(true);

		try {
			const origin = window.location.origin;

			if (mode === "sign-up") {
				const { error } = await authClient.signUp.email({
					name: normalizedName,
					email: normalizedEmail,
					password,
					callbackURL: `${origin}/`,
				});

				if (error) {
					toast.error(error.message ?? "Could not create the account.");
					return;
				}
			} else {
				const { error } = await signIn.email({
					email: normalizedEmail,
					password,
					rememberMe: true,
					callbackURL: `${origin}/`,
				});

				if (error) {
					toast.error(error.message ?? "Email or password is incorrect.");
					return;
				}
			}

			window.location.assign("/");
		} catch {
			toast.error("Could not reach the sign-in service.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
				{mode === "sign-up" ? (
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="name">Full name</Label>
						<Input
							id="name"
							autoComplete="name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
						/>
					</div>
				) : null}

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="email">Email address</Label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						autoComplete={
							mode === "sign-up" ? "new-password" : "current-password"
						}
						minLength={8}
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>
					{mode === "sign-up" ? (
						<p className="text-[11px] text-muted-foreground">
							Use at least 8 characters.
						</p>
					) : null}
				</div>

				{mode === "sign-up" ? (
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="confirm-password">Confirm password</Label>
						<Input
							id="confirm-password"
							type="password"
							autoComplete="new-password"
							minLength={8}
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							required
						/>
					</div>
				) : null}

				<Button type="submit" disabled={pending} className="mt-1 w-full">
					{pending ? <Spinner data-icon="inline-start" /> : null}
					{mode === "sign-up" ? "Create account" : "Sign in with email"}
				</Button>
			</form>

			<button
				type="button"
				className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
				onClick={() =>
					switchMode(mode === "sign-in" ? "sign-up" : "sign-in")
				}
			>
				{mode === "sign-in"
					? "New to Boafo CRM? Create an account"
					: "Already have an account? Sign in"}
			</button>
		</div>
	);
}

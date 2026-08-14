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
	const [showPassword, setShowPassword] = useState(false);
	const [pending, setPending] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (mode === "sign-up" && password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		setPending(true);

		try {
			const origin = window.location.origin;
			const normalizedEmail = email.trim().toLowerCase();

			if (mode === "sign-up") {
				const { error } = await authClient.signUp.email({
					name: name.trim(),
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
					<Label htmlFor="email">Email</Label>
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
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							autoComplete={
								mode === "sign-up" ? "new-password" : "current-password"
							}
							minLength={8}
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className="pr-14"
							required
						/>
						<button
							type="button"
							className="absolute inset-y-0 right-2 text-xs text-muted-foreground hover:text-foreground"
							onClick={() => setShowPassword((visible) => !visible)}
						>
							{showPassword ? "Hide" : "Show"}
						</button>
					</div>
				</div>

				{mode === "sign-up" ? (
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="confirm-password">Confirm password</Label>
						<div className="relative">
							<Input
								id="confirm-password"
								type={showPassword ? "text" : "password"}
								autoComplete="new-password"
								minLength={8}
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
								className="pr-14"
								required
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-2 text-xs text-muted-foreground hover:text-foreground"
								onClick={() => setShowPassword((visible) => !visible)}
							>
								{showPassword ? "Hide" : "Show"}
							</button>
						</div>
					</div>
				) : null}

				{mode === "sign-up" ? (
					<p className="text-xs text-muted-foreground">
						Use at least 8 characters. You can change your password later.
					</p>
				) : null}

				<Button type="submit" disabled={pending} className="mt-1 w-full">
					{pending ? <Spinner data-icon="inline-start" /> : null}
					{mode === "sign-up" ? "Create account" : "Sign in with email"}
				</Button>
			</form>

			<button
				type="button"
				className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
				onClick={() => {
					setMode(mode === "sign-in" ? "sign-up" : "sign-in");
					setPassword("");
					setConfirmPassword("");
					setShowPassword(false);
				}}
			>
				{mode === "sign-in"
					? "New to Boafo CRM? Create an account"
					: "Already have an account? Sign in"}
			</button>
		</div>
	);
}

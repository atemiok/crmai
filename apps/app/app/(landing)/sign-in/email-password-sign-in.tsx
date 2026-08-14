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
	const [pending, setPending] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
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
						<Label htmlFor="name">Name</Label>
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
				</div>

				<Button type="submit" disabled={pending} className="mt-1 w-full">
					{pending ? <Spinner data-icon="inline-start" /> : null}
					{mode === "sign-up" ? "Create account" : "Sign in with email"}
				</Button>
			</form>

			<button
				type="button"
				className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
				onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
			>
				{mode === "sign-in"
					? "First time here? Create account"
					: "Already have an account? Sign in"}
			</button>
		</div>
	);
}

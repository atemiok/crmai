"use client";

import {
	requestPasswordReset,
	sendVerificationEmail,
	signIn,
} from "@crm/auth/client";
import {
	isStrongPassword,
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	PASSWORD_RULES_MESSAGE,
} from "@crm/validation";
import { Button } from "@crm/ui/components/button";
import { Input } from "@crm/ui/components/input";
import { Label } from "@crm/ui/components/label";
import { Spinner } from "@crm/ui/components/spinner";
import { useState } from "react";
import { toast } from "sonner";

export function EmailPasswordSignIn() {
	const [mode, setMode] = useState<
		| "sign-in"
		| "sign-up"
		| "forgot-password"
		| "resend-verification"
	>("sign-in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [pending, setPending] = useState(false);
	const [resendPending, setResendPending] = useState(false);
	const [signupComplete, setSignupComplete] = useState(false);
	const [emailActionComplete, setEmailActionComplete] = useState<
		"forgot-password" | "resend-verification" | null
	>(null);
	const [formError, setFormError] = useState<string | null>(null);

	async function handleResendVerification() {
		setFormError(null);
		setResendPending(true);

		try {
			const { error } = await sendVerificationEmail({
				email: email.trim().toLowerCase(),
				callbackURL: "/sign-in",
			});

			if (error) {
				setFormError(error.message ?? "Could not resend the verification email.");
				return;
			}

			toast.success("Verification email sent.");
		} catch (error) {
			setFormError(
				error instanceof Error
					? error.message
					: "Could not resend the verification email.",
			);
		} finally {
			setResendPending(false);
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);

		if (mode === "sign-up" && password !== confirmPassword) {
			setFormError("Passwords do not match.");
			return;
		}

		if (mode === "sign-up" && !isStrongPassword(password)) {
			setFormError(PASSWORD_RULES_MESSAGE);
			return;
		}

		setPending(true);

		try {
			const normalizedEmail = email.trim().toLowerCase();

			if (mode === "forgot-password" || mode === "resend-verification") {
				if (mode === "forgot-password") {
					await requestPasswordReset({
						email: normalizedEmail,
						redirectTo: "/reset-password",
					});
				} else {
					await sendVerificationEmail({
						email: normalizedEmail,
						callbackURL: "/sign-in",
					});
				}

				setEmailActionComplete(mode);
				return;
			}

			if (mode === "sign-up") {
				const preflight = await fetch(
					`/api/signup-preflight?email=${encodeURIComponent(normalizedEmail)}`,
					{ cache: "no-store" },
				);

				if (!preflight.ok) {
					setFormError(`Signup preflight failed (HTTP ${preflight.status}).`);
					return;
				}

				const preflightData = (await preflight.json()) as {
					allowListConfigured?: boolean;
					emailAllowed?: boolean;
				};

				if (!preflightData.allowListConfigured) {
					setFormError(
						"Account creation is disabled because the API allow-list is not configured.",
					);
					return;
				}

				if (!preflightData.emailAllowed) {
					setFormError(
						`${normalizedEmail} is not allowed by the API sign-in allow-list.`,
					);
					return;
				}

				const emailDelivery = await fetch("/email-delivery-preflight", {
					cache: "no-store",
				});
				if (!emailDelivery.ok) {
					const emailDeliveryBody = await readResponseBody(emailDelivery);
					setFormError(
						extractErrorMessage(emailDeliveryBody) ??
							"Verification email delivery is temporarily unavailable. Please try again later.",
					);
					return;
				}

				const response = await fetch("/auth/sign-up/email", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						name: name.trim(),
						email: normalizedEmail,
						password,
					}),
				});

				const body = await readResponseBody(response);
				if (!response.ok) {
					setFormError(
						`${extractErrorMessage(body) ?? "Could not create the account."} (HTTP ${response.status})`,
					);
					return;
				}

				setSignupComplete(true);
				return;
			} else {
				const { error } = await signIn.email({
					email: normalizedEmail,
					password,
					rememberMe: true,
				});

				if (error) {
					const message = error.message ?? "Email or password is incorrect.";
					setFormError(message);
					return;
				}
			}

			window.location.assign("/");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Could not reach the sign-in service.";
			setFormError(message);
			toast.error(message);
		} finally {
			setPending(false);
		}
	}

	if (signupComplete) {
		return (
			<div className="flex flex-col gap-4">
				<div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm">
					<p className="font-medium">Check your email</p>
					<p className="mt-1 text-xs text-muted-foreground">
						We sent a verification link to {email.trim().toLowerCase()}. Confirm
						your address before signing in.
					</p>
				</div>

				{formError ? (
					<p
						className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
						role="alert"
					>
						{formError}
					</p>
				) : null}

				<Button
					type="button"
					variant="outline"
					disabled={resendPending}
					onClick={handleResendVerification}
					className="w-full"
				>
					{resendPending ? <Spinner data-icon="inline-start" /> : null}
					Resend verification email
				</Button>

				<button
					type="button"
					className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
					onClick={() => {
						setSignupComplete(false);
						setMode("sign-in");
						setPassword("");
						setConfirmPassword("");
						setFormError(null);
					}}
				>
					Return to sign in
				</button>
			</div>
		);
	}

	if (emailActionComplete) {
		const isPasswordReset = emailActionComplete === "forgot-password";

		return (
			<div className="flex flex-col gap-4">
				<div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm">
					<p className="font-medium">Check your email</p>
					<p className="mt-1 text-xs text-muted-foreground">
						If an eligible account exists, we&apos;ll send{" "}
						{isPasswordReset
							? "password reset instructions shortly."
							: "a verification link shortly."}
					</p>
				</div>

				<button
					type="button"
					className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
					onClick={() => {
						setEmailActionComplete(null);
						setMode("sign-in");
						setFormError(null);
					}}
				>
					Return to sign in
				</button>
			</div>
		);
	}

	const isEmailOnlyAction =
		mode === "forgot-password" || mode === "resend-verification";

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

				{!isEmailOnlyAction ? (
					<div className="flex flex-col gap-1.5">
					<Label htmlFor="password">Password</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							autoComplete={
								mode === "sign-up" ? "new-password" : "current-password"
							}
							minLength={PASSWORD_MIN_LENGTH}
							maxLength={PASSWORD_MAX_LENGTH}
							pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,12}"
							title={PASSWORD_RULES_MESSAGE}
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
				) : null}

				{mode === "sign-up" ? (
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="confirm-password">Confirm password</Label>
						<div className="relative">
							<Input
								id="confirm-password"
								type={showPassword ? "text" : "password"}
								autoComplete="new-password"
								minLength={PASSWORD_MIN_LENGTH}
								maxLength={PASSWORD_MAX_LENGTH}
								pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,12}"
								title={PASSWORD_RULES_MESSAGE}
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
						{PASSWORD_RULES_MESSAGE}
					</p>
				) : null}

				{formError ? (
					<p
						className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
						role="alert"
					>
						{formError}
					</p>
				) : null}

				<Button type="submit" disabled={pending} className="mt-1 w-full">
					{pending ? <Spinner data-icon="inline-start" /> : null}
					{mode === "sign-up"
						? "Create account"
						: mode === "forgot-password"
							? "Send reset link"
							: mode === "resend-verification"
								? "Resend verification email"
								: "Sign in with email"}
				</Button>
			</form>

			{mode === "sign-in" ? (
				<div className="flex flex-col items-center gap-3">
					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<button
							type="button"
							className="underline underline-offset-4 hover:text-foreground"
							onClick={() => {
								setMode("forgot-password");
								setPassword("");
								setFormError(null);
							}}
						>
							Forgot your password?
						</button>
						<button
							type="button"
							className="underline underline-offset-4 hover:text-foreground"
							onClick={() => {
								setMode("resend-verification");
								setPassword("");
								setFormError(null);
							}}
						>
							Resend verification email
						</button>
					</div>
					<button
						type="button"
						className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
						onClick={() => {
							setMode("sign-up");
							setPassword("");
							setConfirmPassword("");
							setShowPassword(false);
							setFormError(null);
						}}
					>
						New to Boafo CRM? Create an account
					</button>
				</div>
			) : (
				<button
					type="button"
					className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
					onClick={() => {
						setMode("sign-in");
						setPassword("");
						setConfirmPassword("");
						setShowPassword(false);
						setFormError(null);
					}}
				>
					{mode === "sign-up"
						? "Already have an account? Sign in"
						: "Return to sign in"}
				</button>
			)}
		</div>
	);
}

async function readResponseBody(response: Response): Promise<unknown> {
	const contentType = response.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) {
		return response.json().catch(() => null);
	}
	return response.text().catch(() => null);
}

function extractErrorMessage(body: unknown): string | null {
	if (typeof body === "string" && body.trim()) return body.trim();
	if (!body || typeof body !== "object" || Array.isArray(body)) return null;

	for (const key of ["message", "error", "code"] as const) {
		const value = Reflect.get(body, key);
		if (typeof value === "string" && value.trim()) return value.trim();
	}

	return null;
}

"use client";

import { resetPassword } from "@crm/auth/client";
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
import Link from "next/link";
import { useState } from "react";

type ResetPasswordFormProps = {
	token?: string;
	error?: string;
};

export function ResetPasswordForm({ token, error }: ResetPasswordFormProps) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [status, setStatus] = useState<"ready" | "success" | "invalid" | "failure">(
		error || !token ? "invalid" : "ready",
	);
	const [message, setMessage] = useState<string | null>(
		error || !token
			? "This password reset link is invalid or has expired. Request a new link."
			: null,
	);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!token) return;

		if (!isStrongPassword(password)) {
			setStatus("failure");
			setMessage(PASSWORD_RULES_MESSAGE);
			return;
		}

		if (password !== confirmPassword) {
			setStatus("failure");
			setMessage("Passwords do not match.");
			return;
		}

		setPending(true);
		setMessage(null);

		try {
			const { error: resetError } = await resetPassword({
				newPassword: password,
				token,
			});

			if (resetError) {
				const text = resetError.message ?? "Unable to reset your password.";
				if (/token|expired|invalid/i.test(text)) {
					setStatus("invalid");
					setMessage(
						"This password reset link is invalid or has expired. Request a new link.",
					);
				} else {
					setStatus("failure");
					setMessage(text);
				}
				return;
			}

			setStatus("success");
			setMessage("Your password has been reset. You can now sign in.");
		} catch {
			setStatus("failure");
			setMessage("Unable to reset your password. Please try again.");
		} finally {
			setPending(false);
		}
	}

	if (status === "success" || status === "invalid") {
		return (
			<div className="flex flex-col gap-4">
				<p
					className={
						status === "success"
							? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm"
							: "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive"
					}
					role={status === "invalid" ? "alert" : "status"}
				>
					{message}
				</p>
				<Link
					href="/sign-in"
					className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
				>
					Return to sign in
				</Link>
			</div>
		);
	}

	return (
		<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="new-password">New password</Label>
				<Input
					id="new-password"
					type="password"
					autoComplete="new-password"
					minLength={PASSWORD_MIN_LENGTH}
					maxLength={PASSWORD_MAX_LENGTH}
					pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,12}"
					title={PASSWORD_RULES_MESSAGE}
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					required
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="confirm-new-password">Confirm new password</Label>
				<Input
					id="confirm-new-password"
					type="password"
					autoComplete="new-password"
					minLength={PASSWORD_MIN_LENGTH}
					maxLength={PASSWORD_MAX_LENGTH}
					pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,12}"
					title={PASSWORD_RULES_MESSAGE}
					value={confirmPassword}
					onChange={(event) => setConfirmPassword(event.target.value)}
					required
				/>
			</div>
			<p className="text-xs text-muted-foreground">{PASSWORD_RULES_MESSAGE}</p>
			{message ? (
				<p
					className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
					role="alert"
				>
					{message}
				</p>
			) : null}
			<Button type="submit" disabled={pending} className="mt-1 w-full">
				{pending ? <Spinner data-icon="inline-start" /> : null}
				Reset password
			</Button>
			<Link
				href="/sign-in"
				className="text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
			>
				Return to sign in
			</Link>
		</form>
	);
}
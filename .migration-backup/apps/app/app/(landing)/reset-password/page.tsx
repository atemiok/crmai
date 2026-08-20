import type { Metadata } from "next";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
	title: "Reset password",
};

export const instant = false;

export default async function ResetPasswordPage({
	searchParams,
}: PageProps<"/reset-password">) {
	const { token, error } = await searchParams;

	return (
		<AuthShell>
			<AuthHeading
				title="Reset your password"
				description="Choose a new password for your Boafo CRM account."
			/>
			<ResetPasswordForm
				token={typeof token === "string" ? token : undefined}
				error={typeof error === "string" ? error : undefined}
			/>
		</AuthShell>
	);
}
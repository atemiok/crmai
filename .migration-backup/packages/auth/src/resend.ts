import { ReplitConnectors } from "@replit/connectors-sdk";
import { env } from "./env";

type VerificationEmail = {
	to: string;
	url: string;
};

export async function checkResendAvailability(): Promise<{
	available: boolean;
	status?: number;
	details?: string;
}> {
	try {
		const response = await resendRequest("/domains", { method: "GET" });
		if (response.ok) return { available: true, status: response.status };

		return {
			available: false,
			status: response.status,
			details: (await response.text()).slice(0, 300),
		};
	} catch (error) {
		return {
			available: false,
			details: error instanceof Error ? error.message : "Unknown Resend error.",
		};
	}
}

export async function sendResendVerificationEmail({
	to,
	url,
}: VerificationEmail): Promise<void> {
	const publicUrl = new URL(url);
	const appOrigin = new URL(env.appUrl);
	publicUrl.protocol = appOrigin.protocol;
	publicUrl.host = appOrigin.host;
	if (publicUrl.pathname.startsWith("/api/auth/")) {
		publicUrl.pathname = `/auth/${publicUrl.pathname.slice("/api/auth/".length)}`;
	}

	const response = await resendRequest("/emails", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				from: env.resendFromEmail,
				to: [to],
				reply_to: "info@boafosolutions.com",
				subject: "Confirm your Boafo CRM account",
				html: verificationEmailHtml(publicUrl.toString()),
				text: [
					"Welcome to Boafo CRM.",
					"Confirm your email address to finish creating your account:",
					publicUrl.toString(),
				].join("\n\n"),
			}),
	});

	if (response.ok) {
		const payload = (await response.json().catch(() => null)) as
			| { id?: string }
			| null;
		console.info("[Email delivery] Verification email accepted by Resend", {
			messageId: payload?.id ?? "unknown",
		});
		return;
	}

	const details = (await response.text()).slice(0, 300);
	console.error("[Email delivery] Resend send failed", {
		status: response.status,
		details,
	});
	throw new Error(
		`Resend rejected the verification email (${response.status})${details ? `: ${details}` : "."}`,
	);
}

function verificationEmailHtml(url: string): string {
	const escapedUrl = escapeHtml(url);

	return `
		<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717;max-width:560px">
			<h1 style="font-size:24px;margin-bottom:16px">Confirm your Boafo CRM account</h1>
			<p>Thanks for signing up. Confirm your email address to activate your account.</p>
			<p>
				<a href="${escapedUrl}" style="display:inline-block;background:#047857;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">
					Confirm email address
				</a>
			</p>
			<p style="font-size:13px;color:#525252">This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>
		</div>
	`;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

async function resendRequest(
	path: string,
	init: RequestInit,
): Promise<Response> {
	const headers = new Headers(init.headers);
	if (env.resendApiKey) {
		headers.set("authorization", `Bearer ${env.resendApiKey}`);
		return withTimeout(
			fetch(`https://api.resend.com${path}`, { ...init, headers }),
			15_000,
		);
	}

	return withTimeout(
		new ReplitConnectors().proxy("resend", path, {
			...init,
			headers: Object.fromEntries(headers.entries()),
		}),
		15_000,
	);
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) => {
			setTimeout(
				() => reject(new Error("Resend email request timed out.")),
				milliseconds,
			);
		}),
	]);
}
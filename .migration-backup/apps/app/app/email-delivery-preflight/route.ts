import { ReplitConnectors } from "@replit/connectors-sdk";

export async function GET(request: Request): Promise<Response> {
	void request.url;

	try {
		const response = await withTimeout(
			new ReplitConnectors().proxy("resend", "/domains", {
				method: "GET",
			}),
			10_000,
		);

		if (response.ok) {
			return Response.json({ available: true });
		}

		const details = (await response.text()).slice(0, 300);
		console.error("[Email delivery] Resend preflight rejected", {
			status: response.status,
			details,
		});
	} catch (error) {
		console.error("[Email delivery] Resend preflight failed", error);
	}

	return Response.json(
		{
			available: false,
			message:
				"Verification email delivery is temporarily unavailable. Please try again later.",
		},
		{ status: 503 },
	);
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) => {
			setTimeout(
				() => reject(new Error("Resend preflight timed out.")),
				milliseconds,
			);
		}),
	]);
}
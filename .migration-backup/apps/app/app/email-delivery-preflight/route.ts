import { checkResendAvailability } from "@crm/auth";

export async function GET(request: Request): Promise<Response> {
	void request.url;

	try {
		const result = await checkResendAvailability();
		if (result.available) return Response.json({ available: true });

		console.error("[Email delivery] Resend preflight rejected", {
			status: result.status,
			details: result.details,
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
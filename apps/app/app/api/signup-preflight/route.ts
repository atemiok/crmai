import { API_URL } from "@/lib/env";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const email = url.searchParams.get("email") ?? "";

	try {
		const upstream = await fetch(
			`${API_URL}/auth/signup-preflight?email=${encodeURIComponent(email)}`,
			{
				headers: { accept: "application/json" },
				cache: "no-store",
			},
		);

		const body = await upstream.text();
		return new Response(body, {
			status: upstream.status,
			headers: {
				"content-type": upstream.headers.get("content-type") ?? "application/json",
				"cache-control": "no-store",
			},
		});
	} catch {
		return Response.json(
			{ error: "Could not reach the API signup preflight service." },
			{ status: 502 },
		);
	}
}

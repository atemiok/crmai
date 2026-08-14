import { API_URL } from "@/lib/env";

export async function GET(): Promise<Response> {
	const result: Record<string, unknown> = {
		apiHost: (() => {
			try {
				return new URL(API_URL).host;
			} catch {
				return "invalid";
			}
		})(),
	};

	for (const [key, path] of [
		["health", "/health"],
		["auth", "/api/auth/get-session"],
	] as const) {
		try {
			const response = await fetch(`${API_URL}${path}`, {
				headers: { accept: "application/json" },
				cache: "no-store",
			});
			result[key] = {
				ok: response.ok,
				status: response.status,
				contentType: response.headers.get("content-type"),
			};
		} catch (error) {
			result[key] = {
				ok: false,
				status: null,
				error: error instanceof Error ? error.name : "unknown",
			};
		}
	}

	return Response.json(result, {
		headers: { "cache-control": "no-store" },
	});
}

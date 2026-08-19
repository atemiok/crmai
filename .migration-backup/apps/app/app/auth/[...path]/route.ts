import { auth } from "@crm/auth";

async function handler(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const suffix = url.pathname.slice("/auth".length);
	const authUrl = new URL(`/auth${suffix}`, url);
	authUrl.search = url.search;

	return auth.handler(new Request(authUrl, request));
}

export {
	handler as DELETE,
	handler as GET,
	handler as HEAD,
	handler as OPTIONS,
	handler as PATCH,
	handler as POST,
	handler as PUT,
};
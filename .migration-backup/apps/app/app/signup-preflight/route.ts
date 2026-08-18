import { proxySignupPreflight } from "@/app/lib/signup-preflight";

export async function GET(request: Request): Promise<Response> {
	return proxySignupPreflight(request);
}
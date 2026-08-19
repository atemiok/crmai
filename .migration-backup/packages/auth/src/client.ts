import { ssoClient } from "@better-auth/sso/client";
import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: typeof window === "undefined" ? undefined : window.location.origin,
	basePath: "/auth",
	plugins: [ssoClient(), genericOAuthClient()],
});

export const {
	getSession,
	sendVerificationEmail,
	signIn,
	signOut,
	useSession,
} = authClient;

export type AuthClient = typeof authClient;

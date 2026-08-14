import {
	hasSignInAllowList,
	isWorkspaceEmail,
	type auth,
} from "@crm/auth";
import { Controller, Get, Query } from "@nestjs/common";
import {
	OptionalAuth,
	Session,
	type UserSession,
} from "@thallesp/nestjs-better-auth";
import { AuthService } from "./auth.service";

type CrmSession = UserSession<typeof auth>;

function signupPreflight(email?: string) {
	return {
		allowListConfigured: hasSignInAllowList(),
		emailAllowed: isWorkspaceEmail(email),
		emailPasswordEnabled: true,
	};
}

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get("me")
	async getMe(@Session() session: CrmSession) {
		return { user: await this.authService.getProfile(session.user.id) };
	}

	@Get("session")
	@OptionalAuth()
	getSession(@Session() session?: CrmSession) {
		if (!session) {
			return { authenticated: false, user: null };
		}

		return {
			authenticated: true,
			user: { id: session.user.id, email: session.user.email },
			expiresAt: session.session.expiresAt,
		};
	}

	@Get("signup-preflight")
	@OptionalAuth()
	getSignupPreflight(@Query("email") email?: string) {
		return signupPreflight(email);
	}
}

/**
 * The Replit API artifact owns the /api path, so the Next.js
 * /api/signup-preflight route is forwarded here instead of reaching the
 * app route handler. Keep this alias in sync with /auth/signup-preflight.
 */
@Controller("api")
export class ApiAuthController {
	@Get("signup-preflight")
	@OptionalAuth()
	getSignupPreflight(@Query("email") email?: string) {
		return signupPreflight(email);
	}
}

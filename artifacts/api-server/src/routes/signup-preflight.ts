import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/signup-preflight", (req, res) => {
	const email = typeof req.query.email === "string" ? req.query.email : "";
	const allowList = parseAllowList(process.env.ALLOWED_SIGN_IN);

	res.setHeader("cache-control", "no-store");
	res.json({
		allowListConfigured: allowList.domains.length > 0 || allowList.addresses.length > 0,
		emailAllowed: isAllowedEmail(email, allowList),
		emailPasswordEnabled: true,
	});
});

type AllowList = {
	domains: string[];
	addresses: string[];
};

function parseAllowList(source: string | undefined): AllowList {
	const domains: string[] = [];
	const addresses: string[] = [];

	for (const raw of (source ?? "").split(",")) {
		const entry = raw.trim().toLowerCase().replace(/^@/, "");
		if (!entry) continue;

		(entry.includes("@") ? addresses : domains).push(entry);
	}

	return { domains, addresses };
}

function isAllowedEmail(email: string, allowList: AllowList): boolean {
	const value = email.trim().toLowerCase();
	const [local, host, ...extra] = value.split("@");
	if (!local || !host || extra.length > 0) return false;

	if (allowList.addresses.includes(value)) return true;

	return allowList.domains.some(
		(domain) => host === domain || host.endsWith(`.${domain}`),
	);
}

export default router;
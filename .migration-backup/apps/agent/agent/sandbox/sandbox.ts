import { defaultBackend, defineSandbox } from "eve/sandbox";
import { justbash } from "eve/sandbox/just-bash";

// Replit workflows cannot start the nested Docker/KVM sandboxes that Eve
// normally prefers. The pure-JS backend keeps the agent usable here without
// changing the backend selection used by Vercel or other self-hosted targets.
const isReplit = Boolean(process.env.REPL_ID || process.env.REPLIT_DEV_DOMAIN);

export default defineSandbox({
	backend: isReplit
		? justbash({ autoInstall: false })
		: defaultBackend({
				vercel: { networkPolicy: "deny-all" },
				docker: { networkPolicy: "deny-all" },
				microsandbox: { networkPolicy: "deny-all" },
			}),
});

import { Logger } from "@nestjs/common";
import { createApp } from "./create-app";

async function bootstrap() {
process.env.BETTER_AUTH_SECRET ??= process.env.SESSION_SECRET;
process.env.DATABASE_URL ??= process.env.NEON_DATABASE_URL;
	const app = await createApp();
	app.enableShutdownHooks();

	const port = process.env.PORT ?? 3001;
	await app.listen(port);

	new Logger("Bootstrap").log({
		message: `API listening on http://localhost:${port}`,
		port: Number(port),
		environment: process.env.NODE_ENV ?? "development",
	});
}

void bootstrap().catch((error: unknown) => {
	new Logger("Bootstrap").fatal(
		{ message: "API failed to start" },
		error instanceof Error ? error.stack : String(error),
	);
	process.exit(1);
});

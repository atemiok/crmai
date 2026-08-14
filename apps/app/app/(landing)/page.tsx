import { redirect, unstable_rethrow } from "next/navigation";
import { requireMailboxAccess } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";

export default async function Home() {
	await requireMailboxAccess();

	const workspace = await getServerQueryClient()
		.fetchQuery(getServerTrpc().workspace.get.queryOptions())
		.catch((error: unknown) => {
			unstable_rethrow(error);
			console.error("Home: could not read the workspace.", error);
			return null;
		});

	if (workspace?.slug) {
		redirect(`/${workspace.slug}`);
	}

	redirect("/onboarding");
}

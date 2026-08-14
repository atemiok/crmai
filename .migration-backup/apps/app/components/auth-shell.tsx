import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthShader } from "@/components/auth-shader";

export function AuthShell({ children }: { children: ReactNode }) {
	return (
		<main className="dark grid h-svh overflow-hidden bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
			<section className="relative hidden h-svh overflow-hidden bg-muted p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
				<AuthShader />

				<div className="relative flex gap-2 text-sm/5">
					<Link href="/" aria-label="Boafo CRM" className="flex items-center">
						<Image
							src="/boafo-logo-light.svg"
							alt="Boafo"
							width={200}
							height={60}
							className="h-8 w-auto"
						/>
					</Link>
				</div>

				<div className="relative flex max-w-lg flex-col gap-6">
					<div className="flex flex-col gap-3">
						<p className="font-mono text-xs/4 text-muted-foreground uppercase">
							Boafo CRM
						</p>
						<h1 className="max-w-[14ch] text-5xl/14 font-semibold text-balance">
							Every customer, one place.
						</h1>
					</div>
				</div>

				<p className="relative font-mono text-xs/4 text-muted-foreground">
					Built with love by{" "}
					<a
						href="https://boafosolutions.com"
						target="_blank"
						rel="noreferrer"
						className="underline underline-offset-4 hover:text-foreground"
					>
						Boafo Solutions
					</a>
				</p>
			</section>

			<section className="flex h-svh min-h-0 flex-col overflow-hidden bg-background px-6 py-4 sm:px-10 lg:px-12">
				<div className="flex gap-2 text-sm/5 max-lg:hidden lg:invisible">
					<Image
						src="/boafo-logo-light.svg"
						alt=""
						width={200}
						height={60}
						className="h-7 w-auto"
					/>
				</div>

				<div className="flex min-h-0 flex-1 items-center justify-center py-2">
					<div className="flex w-full max-w-sm flex-col gap-5">{children}</div>
				</div>
			</section>
		</main>
	);
}

export function AuthHeading({
	title,
	description,
}: {
	title: string;
	description: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2 text-left">
			<Link href="/" aria-label="Boafo CRM" className="flex items-center">
				<Image
					src="/boafo-logo-light.svg"
					alt="Boafo"
					width={200}
					height={60}
					className="h-7 w-auto"
				/>
			</Link>
			<div className="flex flex-col gap-0.5">
				<h2 className="text-xl/7 font-semibold tracking-tight text-balance">
					{title}
				</h2>
				<p className="max-w-[32ch] text-sm/5 text-muted-foreground text-pretty">
					{description}
				</p>
			</div>
		</div>
	);
}

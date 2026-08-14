import type * as React from "react";

const Logo = ({
	className,
	...props
}: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={128}
		height={128}
		viewBox="0 0 128 128"
		fill="none"
		aria-label="Boafo Logo"
		role="img"
		className={["dark:invert", className].filter(Boolean).join(" ")}
		{...props}
	>
		<image
			href="/boafo-bird.png"
			width="128"
			height="128"
			preserveAspectRatio="xMidYMid meet"
		/>
	</svg>
);

export default Logo;

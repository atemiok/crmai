import type * as React from "react";

const Logo = ({
	className,
	...props
}: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={512}
		height={512}
		viewBox="0 0 512 512"
		fill="none"
		aria-label="Boafo CRM Logo"
		role="img"
		className={["dark:invert", className].filter(Boolean).join(" ")}
		{...props}
	>
		<image
			href="/boafo-bird.png"
			width="512"
			height="512"
			preserveAspectRatio="xMidYMid meet"
		/>
	</svg>
);

export default Logo;

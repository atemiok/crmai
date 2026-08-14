import type * as React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={512}
		height={512}
		viewBox="0 0 512 512"
		fill="none"
		aria-label="Boafo CRM Logo"
		{...props}
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M128 64h144c82 0 136 45 136 116 0 43-21 77-58 98 45 20 70 58 70 108 0 76-58 126-150 126H128V64Zm80 72v112h58c39 0 62-20 62-56s-23-56-62-56h-58Zm0 184v120h68c41 0 64-21 64-60s-23-60-64-60h-68Z"
			fill="currentColor"
		/>
	</svg>
);

export default Logo;

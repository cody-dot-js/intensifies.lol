import type { ComponentProps } from "react";

import { cx } from "@ngrok/mantle/cx";
import { GithubLogo, Heart } from "@phosphor-icons/react";

export function Footer({ className, ...props }: Omit<ComponentProps<"footer">, "children">) {
	return (
		<footer className={cx("flex items-center justify-center gap-1 px-6 py-4 text-sm", className)} {...props}>
			<span className="text-muted">made w/</span>
			<Heart className="text-danger-600 size-4" weight="fill" />
			<span className="text-muted">by</span>
			<a
				href="https://github.com/cody-dot-js/intensifies.lol"
				target="_blank"
				rel="noopener noreferrer"
				className="text-accent-600 inline-flex items-center gap-1 hover:underline"
			>
				cody.js
				<GithubLogo className="size-4" />
			</a>
		</footer>
	);
}

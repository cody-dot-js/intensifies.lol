import { ThemeProvider } from "@ngrok/mantle/theme";
import { Toaster } from "@ngrok/mantle/toast";
import { useRef, type ComponentRef, type PropsWithChildren } from "react";

import { Header } from "./header";

export function Layout({ children }: PropsWithChildren) {
	const mainRef = useRef<ComponentRef<"main">>(null);

	return (
		<ThemeProvider>
			<Toaster />
			<a
				href="#main"
				className="sr-only"
				onClick={() => {
					mainRef.current?.focus({ preventScroll: true });
				}}
			>
				Skip to main content
			</a>
			<Header />
			<main className="font-body relative focus:outline-hidden" id="main" ref={mainRef} tabIndex={-1}>
				{children}
			</main>
		</ThemeProvider>
	);
}

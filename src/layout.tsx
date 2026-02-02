import { ThemeProvider } from "@ngrok/mantle/theme";
import { Toaster } from "@ngrok/mantle/toast";
import { useRef, type ComponentRef, type PropsWithChildren } from "react";

import { Footer } from "./footer";
import { Header } from "./header";

export function Layout({ children }: PropsWithChildren) {
	const mainRef = useRef<ComponentRef<"main">>(null);

	return (
		<ThemeProvider>
			<Toaster />
			<div className="flex min-h-screen flex-col">
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
				<main className="font-body relative flex-1 focus:outline-hidden" id="main" ref={mainRef} tabIndex={-1}>
					{children}
				</main>
				<Footer />
			</div>
		</ThemeProvider>
	);
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";
import "./index.css";
import { Layout } from "./layout";

const rootElement = document.getElementById("root") || document.body;

if (!rootElement) {
	throw new Error("Cannot find root element!");
}

createRoot(rootElement).render(
	<StrictMode>
		<Layout>
			<App />
		</Layout>
	</StrictMode>,
);

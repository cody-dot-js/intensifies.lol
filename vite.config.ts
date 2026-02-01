import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		viteTsConfigPaths(),
		tailwindcss(),
		react({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	ssr: {
		noExternal: [
			// https://github.com/phosphor-icons/react/issues/45#issuecomment-2721119452
			"@phosphor-icons/react",
		],
	},
});

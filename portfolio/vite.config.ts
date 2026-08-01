/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	// @vitejs/plugin-react injects a Fast Refresh preamble that expects to be
	// bootstrapped from index.html. Under Vitest there is no HTML document
	// driving the transform, so the plugin throws "can't detect preamble" while
	// collecting any .tsx file. Tests do not need Fast Refresh; esbuild's
	// automatic JSX runtime (matching tsconfig's "jsx": "react-jsx") is enough.
	plugins: mode === "test" ? [] : [react()],
	esbuild: { jsx: "automatic" },
	optimizeDeps: {
		// Without this, Vite discovers the three stack only when the lazy chunk is
		// first requested mid-session, re-optimizes, and hard-reloads the page the
		// first time you scroll into the scene.
		include: ["three", "@react-three/fiber", "@react-three/drei"],
	},
	build: {
		// The three/drei async chunk is legitimately large; the default 500 kB
		// warning is pure noise here.
		chunkSizeWarningLimit: 1200,
		// Deliberately no manualChunks. The dynamic import() of CloudScene already
		// gives Rollup a clean async boundary. Naming drei in an object-form
		// manualChunks would pull in its entire entry module and balloon the chunk
		// from the handful of components actually used to the whole library.
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		css: false,
		include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			// The R3F components are excluded: jsdom has no WebGL context, so they
			// render to nothing. Their testable logic is extracted into pure
			// modules (cameraMotion.ts, quality.ts) which ARE covered.
			exclude: [
				"src/three/CloudScene.tsx",
				"src/three/CloudLayers.tsx",
				"src/three/CameraRig.tsx",
				"src/main.tsx",
				"src/Error.tsx",
				"**/*.d.ts",
			],
		},
	},
}));

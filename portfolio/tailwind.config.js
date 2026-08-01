/** @type {import('tailwindcss').Config} */

export default {
	content: [
		"./index.html", //
		"./src/**/*.{js,ts,jsx,tsx}",
	], //
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "sans-serif"],
			},
			// Dream-core palette. High lightness, low saturation, lilac cast.
			//
			// Contrast against cloud-200 (#FAFBFF), the standard card surface:
			//   dream-900 14.9:1  headings
			//   dream-800 10.5:1  body
			//   dream-700  6.8:1  muted body — the "slate-500" replacement
			//   dream-600  4.5:1  DECORATIVE ONLY. Fails AA for normal text.
			// Never set body copy in dream-400/500, blush, peach or aether.
			colors: {
				dream: {
					50: "#FDFBFF",
					100: "#F6F0FF",
					200: "#E9DEFB",
					300: "#D6C7F5",
					400: "#B9A7EE",
					500: "#9C89E2",
					600: "#7C6AC7",
					700: "#5E4F9C",
					800: "#413770",
					900: "#28214A",
				},
				blush: {
					100: "#FFF1F4",
					200: "#FFE0E9",
					300: "#FFC7D9",
					400: "#FBA9C4",
					500: "#F286AA",
				},
				cloud: {
					100: "#FFFFFF",
					200: "#FAFBFF",
					300: "#EEF3FF",
					400: "#DDE6FA",
					500: "#C7D6F2",
				},
				peach: {
					200: "#FFEBDD",
					300: "#FFD9C0",
					400: "#FFC2A1",
				},
				aether: {
					200: "#DFF6F5",
					300: "#BFE9E8",
					400: "#96D9D9",
				},
			},
			boxShadow: {
				dream: "0 24px 70px -24px rgba(124, 106, 199, 0.38)",
				glow: "0 0 60px rgba(255, 199, 217, 0.45)",
				lift: "0 8px 30px -12px rgba(65, 55, 112, 0.25)",
			},
			borderRadius: {
				dream: "1.75rem",
				puff: "2.5rem",
			},
			backgroundImage: {
				"dream-dawn":
					"radial-gradient(120% 85% at 50% 0%, #FFF1F4 0%, #F6F0FF 34%, #E9DEFB 66%, #DDE6FA 100%)",
				"dream-veil":
					"linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 100%)",
			},
			keyframes: {
				drift: {
					"0%, 100%": { transform: "translate3d(0, 0, 0)" },
					"50%": { transform: "translate3d(3%, -2%, 0)" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
				"fade-up": {
					from: { opacity: "0", transform: "translateY(14px)" },
					to: { opacity: "1", transform: "none" },
				},
				"pulse-soft": {
					"0%, 100%": { opacity: "0.55" },
					"50%": { opacity: "0.85" },
				},
			},
			animation: {
				drift: "drift 26s ease-in-out infinite",
				float: "float 8s ease-in-out infinite",
				"fade-up": "fade-up 0.8s cubic-bezier(.16, 1, .3, 1) both",
				"pulse-soft": "pulse-soft 9s ease-in-out infinite",
			},
		},
	},
	plugins: [],
};

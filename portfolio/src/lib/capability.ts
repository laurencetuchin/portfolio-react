import { useEffect, useState } from "react";

/**
 * How much motion this device and this visitor should get.
 *
 *   full   — WebGL cloud field at full quality, pointer parallax on
 *   lite   — WebGL cloud field, fewer layers, lower resolution, no pointer
 *   static — no WebGL at all; SkyBackdrop carries the entire look
 */
export type Tier = "full" | "lite" | "static";

type NavigatorWithHints = Navigator & {
	deviceMemory?: number;
	connection?: { saveData?: boolean };
};

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
	if (typeof window === "undefined" || !window.matchMedia) return false;
	return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function hasWebGL(): boolean {
	try {
		const canvas = document.createElement("canvas");
		const gl =
			canvas.getContext("webgl2") ??
			canvas.getContext("webgl") ??
			canvas.getContext("experimental-webgl");
		if (!gl) return false;
		// Release the probe context immediately; browsers cap concurrent contexts.
		const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
		lose?.loseContext();
		return true;
	} catch {
		return false;
	}
}

export function detectTier(): Tier {
	if (typeof window === "undefined") return "static";

	const nav = navigator as NavigatorWithHints;
	if (prefersReducedMotion()) return "static";
	if (nav.connection?.saveData) return "static";
	if (!hasWebGL()) return "static";

	const lowCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
	const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
	const smallViewport = window.innerWidth < 768;
	const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;

	if (lowCores || lowMemory || smallViewport || coarsePointer) return "lite";
	return "full";
}

/**
 * Detection runs on mount, never during render, so the first paint is always
 * the static tier. That guarantees the WebGL chunk is not even requested until
 * after the page is interactive.
 */
export function useTier(): Tier {
	const [tier, setTier] = useState<Tier>("static");

	useEffect(() => {
		const update = () => setTier(detectTier());
		update();

		const mq = window.matchMedia?.(REDUCED_MOTION_QUERY);
		mq?.addEventListener("change", update);
		return () => mq?.removeEventListener("change", update);
	}, []);

	return tier;
}

export function useReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia?.(REDUCED_MOTION_QUERY);
		if (!mq) return;
		const update = () => setReduced(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	return reduced;
}

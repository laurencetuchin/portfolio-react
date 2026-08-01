import type { Tier } from "../lib/capability";

export type QualitySettings = {
	/** Upper bound for device pixel ratio. Fill rate is the bottleneck here. */
	dpr: number;
	/** Instance ceiling for <Clouds>; it preallocates arrays of this size. */
	limit: number;
	/** Puffs per cloud layer. */
	segments: number;
	/** Number of depth layers to render. */
	layers: number;
	/** Damped pointer parallax on the camera. */
	enablePointer: boolean;
};

const FULL: QualitySettings = {
	dpr: 1.5,
	limit: 90,
	segments: 26,
	layers: 3,
	enablePointer: true,
};

const LITE: QualitySettings = {
	dpr: 1.25,
	limit: 34,
	segments: 16,
	layers: 2,
	enablePointer: false,
};

export function qualityFor(tier: Tier): QualitySettings {
	return tier === "full" ? FULL : LITE;
}

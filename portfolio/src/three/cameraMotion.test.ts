import { describe, expect, it } from "vitest";
import {
	END_POSE,
	FOV_EPSILON,
	LAYER_PARALLAX,
	START_POSE,
	clamp01,
	damp,
	easeOutCubic,
	fovNeedsUpdate,
	layerOffset,
	pointerOffset,
	poseForProgress,
} from "./cameraMotion";

describe("poseForProgress", () => {
	it("sits at the start pose before any scrolling", () => {
		expect(poseForProgress(0)).toEqual(START_POSE);
	});

	it("reaches the end pose at full progress", () => {
		const pose = poseForProgress(1);
		expect(pose.y).toBeCloseTo(END_POSE.y, 6);
		expect(pose.z).toBeCloseTo(END_POSE.z, 6);
		expect(pose.rotationX).toBeCloseTo(END_POSE.rotationX, 6);
		expect(pose.fov).toBeCloseTo(END_POSE.fov, 6);
	});

	it("clamps out-of-range progress instead of flying past the scene", () => {
		expect(poseForProgress(-5)).toEqual(poseForProgress(0));
		expect(poseForProgress(99)).toEqual(poseForProgress(1));
	});

	it("dollies the camera forward as progress increases", () => {
		const z = [0, 0.25, 0.5, 0.75, 1].map((p) => poseForProgress(p).z);
		for (let i = 1; i < z.length; i++) expect(z[i]).toBeLessThan(z[i - 1]);
	});

	it("rises monotonically", () => {
		const y = [0, 0.25, 0.5, 0.75, 1].map((p) => poseForProgress(p).y);
		for (let i = 1; i < y.length; i++) expect(y[i]).toBeGreaterThan(y[i - 1]);
	});

	it("eases the rise but not the dolly, so the two decouple mid-flight", () => {
		// This mismatch is what makes the cloud layers shear against each other.
		// If someone "tidies" the rise to a plain lerp, the parallax flattens.
		const mid = poseForProgress(0.5);

		const linearY = START_POSE.y + (END_POSE.y - START_POSE.y) * 0.5;
		expect(mid.y).toBeGreaterThan(linearY);

		const linearZ = START_POSE.z + (END_POSE.z - START_POSE.z) * 0.5;
		expect(mid.z).toBeCloseTo(linearZ, 6);
	});

	it("tilts downward, never upward", () => {
		for (const p of [0.2, 0.5, 0.8, 1]) {
			expect(poseForProgress(p).rotationX).toBeLessThanOrEqual(0);
		}
	});

	it("never moves the camera laterally from scroll alone", () => {
		for (const p of [0, 0.3, 0.7, 1]) expect(poseForProgress(p).x).toBe(0);
	});

	it("widens the field of view slightly, for a sense of opening out", () => {
		expect(poseForProgress(1).fov).toBeGreaterThan(poseForProgress(0).fov);
	});
});

describe("easing helpers", () => {
	it("easeOutCubic is pinned at both ends", () => {
		expect(easeOutCubic(0)).toBe(0);
		expect(easeOutCubic(1)).toBe(1);
	});

	it("easeOutCubic decelerates — front-loaded, not back-loaded", () => {
		expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
		const firstHalf = easeOutCubic(0.5) - easeOutCubic(0);
		const secondHalf = easeOutCubic(1) - easeOutCubic(0.5);
		expect(firstHalf).toBeGreaterThan(secondHalf);
	});

	it("clamp01 bounds both directions", () => {
		expect(clamp01(-3)).toBe(0);
		expect(clamp01(0.4)).toBe(0.4);
		expect(clamp01(7)).toBe(1);
	});
});

describe("damp", () => {
	it("moves toward the target without overshooting", () => {
		let v = 0;
		for (let i = 0; i < 200; i++) v = damp(v, 10, 4, 1 / 60);
		expect(v).toBeGreaterThan(9.9);
		expect(v).toBeLessThanOrEqual(10);
	});

	it("is frame-rate independent", () => {
		// The whole reason for damp() over a fixed lerp factor: a 30 fps device
		// (or iOS Low Power Mode) must not glide at half speed.
		let at60 = 0;
		for (let i = 0; i < 60; i++) at60 = damp(at60, 1, 4, 1 / 60);

		let at30 = 0;
		for (let i = 0; i < 30; i++) at30 = damp(at30, 1, 4, 1 / 30);

		expect(at60).toBeCloseTo(at30, 3);
	});

	it("does not move when already at the target", () => {
		expect(damp(5, 5, 4, 1 / 60)).toBeCloseTo(5, 10);
	});

	it("approaches from above as well as below", () => {
		let v = 10;
		for (let i = 0; i < 200; i++) v = damp(v, 2, 4, 1 / 60);
		expect(v).toBeLessThan(2.1);
		expect(v).toBeGreaterThanOrEqual(2);
	});

	it("does nothing across a zero-length frame", () => {
		expect(damp(0, 100, 4, 0)).toBe(0);
	});
});

describe("pointerOffset", () => {
	it("is zero when disabled, whatever the pointer is doing", () => {
		expect(pointerOffset(1, -1, false)).toEqual({ x: 0, y: 0 });
	});

	it("scales with pointer position when enabled", () => {
		const offset = pointerOffset(1, 1, true);
		expect(offset.x).toBeGreaterThan(0);
		expect(offset.y).toBeGreaterThan(0);
	});

	it("stays subtle — never enough to read as a look-around control", () => {
		const offset = pointerOffset(1, 1, true);
		expect(Math.abs(offset.x)).toBeLessThan(0.2);
		expect(Math.abs(offset.y)).toBeLessThan(0.2);
	});

	it("clamps pointer values outside the normalised range", () => {
		expect(pointerOffset(50, -50, true)).toEqual(pointerOffset(1, -1, true));
	});

	it("is symmetric about the origin", () => {
		const positive = pointerOffset(0.5, 0.5, true);
		const negative = pointerOffset(-0.5, -0.5, true);
		expect(negative.x).toBeCloseTo(-positive.x, 10);
		expect(negative.y).toBeCloseTo(-positive.y, 10);
	});
});

describe("layerOffset", () => {
	it("moves nearer layers further than distant ones", () => {
		const back = layerOffset(0, 1);
		const mid = layerOffset(1, 1);
		const front = layerOffset(2, 1);

		expect(mid).toBeGreaterThan(back);
		expect(front).toBeGreaterThan(mid);
	});

	it("is zero for every layer at rest, so nothing jumps on load", () => {
		for (let i = 0; i < LAYER_PARALLAX.length; i++) expect(layerOffset(i, 0)).toBe(0);
	});

	it("falls back to the nearest factor for an out-of-range layer", () => {
		expect(layerOffset(99, 1)).toBe(LAYER_PARALLAX[LAYER_PARALLAX.length - 1]);
	});

	it("clamps progress", () => {
		expect(layerOffset(1, 5)).toBe(layerOffset(1, 1));
		expect(layerOffset(1, -5)).toBe(layerOffset(1, 0));
	});
});

describe("fovNeedsUpdate", () => {
	it("ignores changes below the epsilon", () => {
		expect(fovNeedsUpdate(60, 60 + FOV_EPSILON / 2)).toBe(false);
	});

	it("reports meaningful changes", () => {
		expect(fovNeedsUpdate(60, 61)).toBe(true);
	});

	it("is direction-agnostic", () => {
		expect(fovNeedsUpdate(61, 60)).toBe(true);
	});
});

/**
 * The scroll -> camera mapping, kept as pure functions.
 *
 * CameraRig applies these inside useFrame. Isolating the maths here means the
 * flight path is unit-testable without a WebGL context, which jsdom cannot
 * provide. Nothing in this module imports three.
 */

export type CameraPose = {
	x: number;
	y: number;
	z: number;
	rotationX: number;
	fov: number;
};

/** Start of the flight: below the cloud deck, looking straight ahead. */
export const START_POSE: CameraPose = {
	x: 0,
	y: 0,
	z: 5,
	rotationX: 0,
	fov: 60,
};

/** End of the flight: risen above the deck, tilted down, slightly wider. */
export const END_POSE: CameraPose = {
	x: 0,
	y: 1.6,
	z: 1.2,
	rotationX: -0.13,
	fov: 68,
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Decelerating ease. The rise should feel like floating up, not launching. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Frame-rate independent exponential smoothing, matching three's MathUtils.damp.
 * Reimplemented rather than imported so this module stays three-free.
 *
 * `lambda` is the approach rate; higher is snappier. The dreamlike glide comes
 * almost entirely from keeping this low (~4).
 */
export function damp(current: number, target: number, lambda: number, delta: number) {
	return lerp(current, target, 1 - Math.exp(-lambda * delta));
}

/**
 * Map hero scroll progress (0..1) to a camera pose.
 *
 * z and rotation move linearly while y is eased, so the rise lags the dolly
 * slightly — that mismatch is what sells the parallax against the cloud layers.
 */
export function poseForProgress(progress: number): CameraPose {
	const p = clamp01(progress);
	const eased = easeOutCubic(p);

	return {
		x: START_POSE.x,
		y: lerp(START_POSE.y, END_POSE.y, eased),
		z: lerp(START_POSE.z, END_POSE.z, p),
		rotationX: lerp(START_POSE.rotationX, END_POSE.rotationX, p),
		fov: lerp(START_POSE.fov, END_POSE.fov, p),
	};
}

/**
 * Pointer parallax offset, added on top of the scroll pose.
 * Deliberately small — this is a hint of depth, not a look-around control.
 */
export const POINTER_STRENGTH = 0.15;

export function pointerOffset(pointerX: number, pointerY: number, enabled: boolean) {
	if (!enabled) return { x: 0, y: 0 };
	return {
		x: clampSigned(pointerX) * POINTER_STRENGTH,
		y: clampSigned(pointerY) * POINTER_STRENGTH,
	};
}

const clampSigned = (n: number) => (n < -1 ? -1 : n > 1 ? 1 : n);

/**
 * Per-layer vertical drift. Nearer layers travel further for the same scroll,
 * which is the parallax itself.
 */
export const LAYER_PARALLAX = [0.6, 1.8, 4.0];

export function layerOffset(layerIndex: number, progress: number) {
	const factor = LAYER_PARALLAX[layerIndex] ?? LAYER_PARALLAX[LAYER_PARALLAX.length - 1];
	return clamp01(progress) * factor;
}

/** Avoid rebuilding the projection matrix for imperceptible fov changes. */
export const FOV_EPSILON = 0.01;

export function fovNeedsUpdate(currentFov: number, nextFov: number) {
	return Math.abs(currentFov - nextFov) > FOV_EPSILON;
}

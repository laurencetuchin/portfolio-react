import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia, stubNavigator, stubWebGL } from "../test/testUtils";
import { detectTier, prefersReducedMotion, useTier } from "./capability";

describe("detectTier", () => {
	let restoreWebGL: (() => void) | null = null;

	afterEach(() => {
		restoreWebGL?.();
		restoreWebGL = null;
		vi.unstubAllGlobals();
	});

	it("returns 'full' on a capable desktop", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		expect(detectTier()).toBe("full");
	});

	it("returns 'static' when the visitor prefers reduced motion", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia("prefers-reduced-motion");
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		expect(detectTier()).toBe("static");
	});

	it("returns 'static' when WebGL is unavailable", () => {
		restoreWebGL = stubWebGL(false);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		expect(detectTier()).toBe("static");
	});

	it("returns 'static' when the visitor has Data Saver on", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16, saveData: true });
		vi.stubGlobal("innerWidth", 1440);

		expect(detectTier()).toBe("static");
	});

	it("checks reduced motion before WebGL, so the preference always wins", () => {
		// Even on a machine that could render the scene beautifully.
		restoreWebGL = stubWebGL(true);
		stubMatchMedia("prefers-reduced-motion");
		stubNavigator({ hardwareConcurrency: 32, deviceMemory: 32 });
		vi.stubGlobal("innerWidth", 2560);

		expect(detectTier()).toBe("static");
	});

	it("returns 'lite' on a narrow viewport", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 480);

		expect(detectTier()).toBe("lite");
	});

	it("returns 'lite' on a low-core device", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 4, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		expect(detectTier()).toBe("lite");
	});

	it("returns 'lite' on a low-memory device", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 4 });
		vi.stubGlobal("innerWidth", 1440);

		expect(detectTier()).toBe("lite");
	});

	it("returns 'lite' for a coarse pointer even on a wide viewport (tablets)", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia("pointer: coarse");
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		expect(detectTier()).toBe("lite");
	});

	it("treats a missing deviceMemory hint as capable rather than low-end", () => {
		// Safari and Firefox do not implement deviceMemory. Absent must not be
		// read as 0, or every Safari visitor is silently downgraded.
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16 });
		vi.stubGlobal("innerWidth", 1440);

		expect(detectTier()).toBe("full");
	});

	it("survives a WebGL probe that throws", () => {
		const original = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = () => {
			throw new Error("context creation blocked");
		};
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16 });

		expect(() => detectTier()).not.toThrow();
		expect(detectTier()).toBe("static");

		HTMLCanvasElement.prototype.getContext = original;
	});

	it("releases the probe context so it does not count against the browser limit", () => {
		const loseContext = vi.fn();
		const original = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = ((type: string) =>
			type.includes("webgl")
				? { getExtension: () => ({ loseContext }) }
				: null) as typeof HTMLCanvasElement.prototype.getContext;

		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16 });
		vi.stubGlobal("innerWidth", 1440);

		detectTier();
		expect(loseContext).toHaveBeenCalled();

		HTMLCanvasElement.prototype.getContext = original;
	});
});

describe("prefersReducedMotion", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("is false when the media query does not match", () => {
		stubMatchMedia(null);
		expect(prefersReducedMotion()).toBe(false);
	});

	it("is true when the media query matches", () => {
		stubMatchMedia("prefers-reduced-motion");
		expect(prefersReducedMotion()).toBe(true);
	});

	it("does not throw when matchMedia is unavailable", () => {
		vi.stubGlobal("matchMedia", undefined);
		expect(() => prefersReducedMotion()).not.toThrow();
		expect(prefersReducedMotion()).toBe(false);
	});
});

describe("useTier", () => {
	let restoreWebGL: (() => void) | null = null;

	afterEach(() => {
		restoreWebGL?.();
		restoreWebGL = null;
		vi.unstubAllGlobals();
	});

	it("settles on the detected tier after mount", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		const { result } = renderHook(() => useTier());
		expect(result.current).toBe("full");
	});

	it("re-evaluates when the motion preference changes mid-session", () => {
		restoreWebGL = stubWebGL(true);
		const media = stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		const { result } = renderHook(() => useTier());
		expect(result.current).toBe("full");

		// The visitor turns on Reduce Motion in their OS.
		stubMatchMedia("prefers-reduced-motion");
		act(() => media.emitChange());

		expect(result.current).toBe("static");
	});

	it("unsubscribes from the media query on unmount", () => {
		restoreWebGL = stubWebGL(true);
		const media = stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16 });

		const { unmount } = renderHook(() => useTier());
		expect(media.listenerCount).toBeGreaterThan(0);

		unmount();
		expect(media.listenerCount).toBe(0);
	});
});

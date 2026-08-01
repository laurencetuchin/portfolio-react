import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "../test/testUtils";
import { DEFAULT_INTERVAL_MS, useRotatingWord } from "./useRotatingWord";

const WORDS = ["react", "typescript", "snowboarding"] as const;

describe("useRotatingWord", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		stubMatchMedia(null);
	});

	afterEach(() => {
		// Must run before the shared afterEach in test/setup.ts: spies installed
		// on globalThis timers otherwise survive into the next test, where the
		// hook's cleanup finds clearInterval missing.
		vi.restoreAllMocks();
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it("starts on the first word, already styled", () => {
		const { result } = renderHook(() => useRotatingWord(WORDS));
		expect(result.current.index).toBe(0);
		expect(result.current.word).toBe("react");
	});

	it("advances on each interval", () => {
		const { result } = renderHook(() => useRotatingWord(WORDS));

		act(() => void vi.advanceTimersByTime(DEFAULT_INTERVAL_MS));
		expect(result.current.word).toBe("typescript");

		act(() => void vi.advanceTimersByTime(DEFAULT_INTERVAL_MS));
		expect(result.current.word).toBe("snowboarding");
	});

	it("wraps around to the start", () => {
		const { result } = renderHook(() => useRotatingWord(WORDS));

		act(() => void vi.advanceTimersByTime(DEFAULT_INTERVAL_MS * WORDS.length));
		expect(result.current.index).toBe(0);
		expect(result.current.word).toBe("react");
	});

	it("advances by position, so duplicate words do not derail the cycle", () => {
		// The original implementation looked its position up with indexOf, which
		// meant a repeated entry sent the rotation back to the first occurrence
		// and it never reached the tail of the list.
		const dupes = ["a", "b", "a", "c"] as const;
		const { result } = renderHook(() => useRotatingWord(dupes));

		const seen: string[] = [result.current.word];
		for (let i = 0; i < 3; i++) {
			act(() => void vi.advanceTimersByTime(DEFAULT_INTERVAL_MS));
			seen.push(result.current.word);
		}

		expect(seen).toEqual(["a", "b", "a", "c"]);
	});

	it("installs exactly one interval for the component's lifetime", () => {
		// The original recreated its interval on every tick because the effect
		// depended on the current word.
		const setSpy = vi.spyOn(globalThis, "setInterval");
		renderHook(() => useRotatingWord(WORDS));

		expect(setSpy).toHaveBeenCalledTimes(1);

		act(() => void vi.advanceTimersByTime(DEFAULT_INTERVAL_MS * 5));
		expect(setSpy).toHaveBeenCalledTimes(1);
	});

	it("clears its interval on unmount", () => {
		const clearSpy = vi.spyOn(globalThis, "clearInterval");
		const { unmount } = renderHook(() => useRotatingWord(WORDS));

		unmount();
		expect(clearSpy).toHaveBeenCalled();
	});

	it("rotates slowly enough to be readable", () => {
		// 500ms — the original cadence — reads as a strobe and fights the calm
		// aesthetic the rest of the page is going for.
		expect(DEFAULT_INTERVAL_MS).toBeGreaterThanOrEqual(1500);
	});

	it("freezes when the visitor prefers reduced motion", () => {
		stubMatchMedia("prefers-reduced-motion");
		const { result } = renderHook(() => useRotatingWord(WORDS));

		expect(result.current.isPaused).toBe(true);

		act(() => void vi.advanceTimersByTime(DEFAULT_INTERVAL_MS * 10));
		expect(result.current.word).toBe("react");
	});

	it("can be paused explicitly", () => {
		const { result } = renderHook(() => useRotatingWord(WORDS, { paused: true }));

		act(() => void vi.advanceTimersByTime(DEFAULT_INTERVAL_MS * 4));
		expect(result.current.index).toBe(0);
	});

	it("honours a custom interval", () => {
		const { result } = renderHook(() => useRotatingWord(WORDS, { intervalMs: 100 }));

		act(() => void vi.advanceTimersByTime(100));
		expect(result.current.word).toBe("typescript");
	});

	it("does not start a timer for a single-item list", () => {
		const setSpy = vi.spyOn(globalThis, "setInterval");
		renderHook(() => useRotatingWord(["only"]));
		expect(setSpy).not.toHaveBeenCalled();
	});

	it("handles an empty list without crashing", () => {
		const { result } = renderHook(() => useRotatingWord([] as string[]));
		expect(result.current.index).toBe(0);
		expect(result.current.word).toBeUndefined();
	});

	it("stays in range if the list shrinks beneath the held index", () => {
		const { result, rerender } = renderHook(
			({ items }) => useRotatingWord(items),
			{ initialProps: { items: ["a", "b", "c", "d"] } }
		);

		act(() => void vi.advanceTimersByTime(DEFAULT_INTERVAL_MS * 3));
		expect(result.current.index).toBe(3);

		rerender({ items: ["a", "b"] });
		expect(result.current.index).toBeLessThan(2);
		expect(result.current.word).toBeDefined();
	});
});

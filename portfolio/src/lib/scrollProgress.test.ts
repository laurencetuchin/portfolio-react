import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeScroll, observeScrollCssVar, scrollState } from "./scrollProgress";

function setScroll(y: number) {
	vi.stubGlobal("scrollY", y);
	window.dispatchEvent(new Event("scroll"));
}

function setDocumentHeight(height: number) {
	Object.defineProperty(document.documentElement, "scrollHeight", {
		value: height,
		configurable: true,
	});
}

describe("scrollProgress", () => {
	beforeEach(() => {
		vi.stubGlobal("innerHeight", 1000);
		setDocumentHeight(5000);
		scrollState.target = 0;
		scrollState.current = 0;
		scrollState.pageTarget = 0;
		scrollState.pageCurrent = 0;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("reports 0 at the top of the page", () => {
		const stop = observeScroll();
		setScroll(0);
		expect(scrollState.target).toBe(0);
		stop();
	});

	it("completes hero progress over 1.2 viewport heights, not 1", () => {
		const stop = observeScroll();

		// One full viewport is deliberately NOT the end of the animation.
		setScroll(1000);
		expect(scrollState.target).toBeCloseTo(1000 / 1200, 5);
		expect(scrollState.target).toBeLessThan(1);

		setScroll(1200);
		expect(scrollState.target).toBe(1);

		stop();
	});

	it("clamps hero progress to 1 past the end and never exceeds it", () => {
		const stop = observeScroll();
		setScroll(99999);
		expect(scrollState.target).toBe(1);
		stop();
	});

	it("clamps to 0 for negative scroll (iOS rubber-banding)", () => {
		const stop = observeScroll();
		setScroll(-400);
		expect(scrollState.target).toBe(0);
		expect(scrollState.pageTarget).toBe(0);
		stop();
	});

	it("tracks whole-page progress independently of hero progress", () => {
		const stop = observeScroll();
		// scrollable = 5000 - 1000 = 4000
		setScroll(2000);
		expect(scrollState.pageTarget).toBeCloseTo(0.5, 5);
		// Hero progress has long since saturated.
		expect(scrollState.target).toBe(1);
		stop();
	});

	it("does not divide by zero when the document is not scrollable", () => {
		setDocumentHeight(1000); // scrollHeight === innerHeight
		const stop = observeScroll();
		setScroll(0);
		expect(scrollState.pageTarget).toBe(0);
		expect(Number.isNaN(scrollState.pageTarget)).toBe(false);
		stop();
	});

	it("recomputes on resize without needing a scroll event", () => {
		const stop = observeScroll();
		setScroll(600);
		expect(scrollState.target).toBeCloseTo(0.5, 5);

		// Viewport halves: the same scroll offset is now a full hero progress.
		vi.stubGlobal("innerHeight", 500);
		window.dispatchEvent(new Event("resize"));
		expect(scrollState.target).toBe(1);

		stop();
	});

	it("registers listeners once no matter how many observers start", () => {
		const addSpy = vi.spyOn(window, "addEventListener");
		const removeSpy = vi.spyOn(window, "removeEventListener");

		const stopA = observeScroll();
		const stopB = observeScroll();
		const stopC = observeScroll();

		const scrollAdds = addSpy.mock.calls.filter(([type]) => type === "scroll");
		expect(scrollAdds).toHaveLength(1);

		// Listeners must survive until the LAST observer detaches, otherwise one
		// unmounting component silently freezes the scene for everything else.
		stopA();
		stopB();
		expect(removeSpy.mock.calls.filter(([t]) => t === "scroll")).toHaveLength(0);

		stopC();
		expect(removeSpy.mock.calls.filter(([t]) => t === "scroll")).toHaveLength(1);
	});

	it("attaches the scroll listener as passive so it cannot block scrolling", () => {
		const addSpy = vi.spyOn(window, "addEventListener");
		const stop = observeScroll();

		const call = addSpy.mock.calls.find(([type]) => type === "scroll");
		expect(call?.[2]).toMatchObject({ passive: true });

		stop();
	});

	it("is idempotent when a stop function is called twice", () => {
		const removeSpy = vi.spyOn(window, "removeEventListener");

		const stopA = observeScroll();
		const stopB = observeScroll();

		stopA();
		stopA(); // double-call must not decrement the refcount twice
		expect(removeSpy.mock.calls.filter(([t]) => t === "scroll")).toHaveLength(0);

		stopB();
		expect(removeSpy.mock.calls.filter(([t]) => t === "scroll")).toHaveLength(1);
	});
});

describe("scrollProgress CSS variable publishing", () => {
	beforeEach(() => {
		vi.stubGlobal("innerHeight", 1000);
		setDocumentHeight(5000);
		scrollState.pageCurrent = 0;
		document.documentElement.style.removeProperty("--scroll-progress");
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("does not run a rAF loop until something subscribes", () => {
		const rafSpy = vi.spyOn(window, "requestAnimationFrame");
		const stop = observeScroll(); // plain observer, no CSS var
		expect(rafSpy).not.toHaveBeenCalled();
		stop();
	});

	it("publishes --scroll-progress and eases toward the target", () => {
		// Collected in an array rather than a `let`: TypeScript cannot see the
		// assignment inside the mock callback and narrows a nullable binding to
		// `null`, making it uncallable.
		const frames: FrameRequestCallback[] = [];
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
			frames.push(cb);
			return 1;
		});

		const tick = () => frames[frames.length - 1]?.(0);

		const stop = observeScrollCssVar();
		setScroll(4000); // pageTarget === 1

		// Drive several frames; the damped follower should approach but the first
		// frame must not jump straight to the target.
		tick();
		const afterOne = Number(
			document.documentElement.style.getPropertyValue("--scroll-progress")
		);
		expect(afterOne).toBeGreaterThan(0);
		expect(afterOne).toBeLessThan(1);

		for (let i = 0; i < 60; i++) tick();
		const afterMany = Number(
			document.documentElement.style.getPropertyValue("--scroll-progress")
		);
		expect(afterMany).toBeGreaterThan(afterOne);
		expect(afterMany).toBeLessThanOrEqual(1);

		stop();
	});

	it("cancels the rAF loop when the last CSS subscriber detaches", () => {
		vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42);
		const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");

		const stopA = observeScrollCssVar();
		const stopB = observeScrollCssVar();

		stopA();
		expect(cancelSpy).not.toHaveBeenCalled();

		stopB();
		expect(cancelSpy).toHaveBeenCalledWith(42);
	});
});

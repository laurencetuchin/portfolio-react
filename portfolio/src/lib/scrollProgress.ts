/**
 * Scroll progress as a module-level singleton, deliberately NOT React state.
 *
 * The 3D scene needs scroll position every frame. Routing that through
 * useState would re-render the React tree 60+ times a second. Instead the
 * listener writes into a plain mutable object and `useFrame` reads it.
 *
 * There is no requestAnimationFrame loop here for the 3D path: smoothing
 * happens inside useFrame via MathUtils.damp, which is already running and is
 * frame-rate independent. The optional rAF below exists only to publish a CSS
 * custom property for DOM-side effects, and is ref-counted so it does not run
 * unless something actually subscribes.
 */

export type ScrollState = {
	/** Hero progress, 0 at the top to 1 after ~1.2 viewport heights. */
	target: number;
	/** Damped follower of `target`, written by the scene each frame. */
	current: number;
	/** Whole-document progress, 0 to 1. */
	pageTarget: number;
	/** Damped follower of `pageTarget`. */
	pageCurrent: number;
};

export const scrollState: ScrollState = {
	target: 0,
	current: 0,
	pageTarget: 0,
	pageCurrent: 0,
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function read() {
	const y = window.scrollY;
	// The hero animation completes over 1.2 viewport heights, so the camera is
	// still settling slightly after the fold rather than stopping dead at it.
	scrollState.target = clamp01(y / (window.innerHeight * 1.2));

	const scrollable = document.documentElement.scrollHeight - window.innerHeight;
	scrollState.pageTarget = scrollable > 0 ? clamp01(y / scrollable) : 0;
}

let listening = 0;

/** Start the shared scroll/resize listeners. Returns a matching stop function. */
export function observeScroll(): () => void {
	if (typeof window === "undefined") return () => undefined;

	listening += 1;
	if (listening === 1) {
		read();
		window.addEventListener("scroll", read, { passive: true });
		window.addEventListener("resize", read, { passive: true });
	}

	let stopped = false;
	return () => {
		if (stopped) return;
		stopped = true;
		listening -= 1;
		if (listening === 0) {
			window.removeEventListener("scroll", read);
			window.removeEventListener("resize", read);
		}
	};
}

let rafId = 0;
let cssSubscribers = 0;

function publishCssVar() {
	scrollState.pageCurrent += (scrollState.pageTarget - scrollState.pageCurrent) * 0.12;
	document.documentElement.style.setProperty(
		"--scroll-progress",
		scrollState.pageCurrent.toFixed(4)
	);
	rafId = window.requestAnimationFrame(publishCssVar);
}

/**
 * Publish `--scroll-progress` on <html> for CSS-driven parallax. One DOM write
 * per frame, shared by every consumer.
 */
export function observeScrollCssVar(): () => void {
	if (typeof window === "undefined") return () => undefined;

	const stopScroll = observeScroll();
	cssSubscribers += 1;
	if (cssSubscribers === 1) rafId = window.requestAnimationFrame(publishCssVar);

	let stopped = false;
	return () => {
		if (stopped) return;
		stopped = true;
		cssSubscribers -= 1;
		if (cssSubscribers === 0 && rafId) {
			window.cancelAnimationFrame(rafId);
			rafId = 0;
		}
		stopScroll();
	};
}

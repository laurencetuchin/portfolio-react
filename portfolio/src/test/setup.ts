import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

/**
 * jsdom implements neither matchMedia nor IntersectionObserver, both of which
 * this codebase reads at mount. Default them to the least surprising values:
 * no media query matches (so `prefers-reduced-motion` is absent, the common
 * case) and an observer that never fires.
 *
 * Individual tests override these via `stubMatchMedia` in test-utils.
 */
if (!window.matchMedia) {
	window.matchMedia = ((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: () => undefined,
		removeEventListener: () => undefined,
		addListener: () => undefined,
		removeListener: () => undefined,
		dispatchEvent: () => false,
	})) as unknown as typeof window.matchMedia;
}

if (!window.IntersectionObserver) {
	window.IntersectionObserver = class {
		readonly root = null;
		readonly rootMargin = "";
		readonly thresholds: readonly number[] = [];
		observe() {
			return undefined;
		}
		unobserve() {
			return undefined;
		}
		disconnect() {
			return undefined;
		}
		takeRecords(): IntersectionObserverEntry[] {
			return [];
		}
	} as unknown as typeof window.IntersectionObserver;
}

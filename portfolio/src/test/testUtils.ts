import { vi } from "vitest";

/**
 * Replace window.matchMedia with one that reports `matches: true` for any query
 * containing `matching`. Returns the change-listener registry so tests can
 * simulate the user flipping their OS motion preference mid-session.
 */
export function stubMatchMedia(matching: string | null) {
	const listeners = new Set<(e: MediaQueryListEvent) => void>();

	const impl = (query: string) => ({
		matches: matching !== null && query.includes(matching),
		media: query,
		onchange: null,
		addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
			listeners.add(fn);
		},
		removeEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
			listeners.delete(fn);
		},
		addListener: () => undefined,
		removeListener: () => undefined,
		dispatchEvent: () => false,
	});

	vi.stubGlobal("matchMedia", impl as unknown as typeof window.matchMedia);

	return {
		emitChange() {
			listeners.forEach((fn) => fn({} as MediaQueryListEvent));
		},
		get listenerCount() {
			return listeners.size;
		},
	};
}

/** Stub the navigator hints that capability detection reads. */
export function stubNavigator(hints: {
	hardwareConcurrency?: number;
	deviceMemory?: number;
	saveData?: boolean;
}) {
	const base = {
		hardwareConcurrency: hints.hardwareConcurrency ?? 16,
		userAgent: navigator.userAgent,
	} as Record<string, unknown>;

	if (hints.deviceMemory !== undefined) base.deviceMemory = hints.deviceMemory;
	if (hints.saveData !== undefined) base.connection = { saveData: hints.saveData };

	vi.stubGlobal("navigator", base);
}

/**
 * Control whether the WebGL capability probe succeeds. jsdom's canvas returns
 * null from getContext for every context type, so the default is "no WebGL" —
 * tests that want the full tier must opt in.
 */
export function stubWebGL(available: boolean) {
	const original = HTMLCanvasElement.prototype.getContext;

	HTMLCanvasElement.prototype.getContext = function (
		this: HTMLCanvasElement,
		type: string
	): RenderingContext | null {
		if (type === "webgl2" || type === "webgl" || type === "experimental-webgl") {
			return available
				? ({ getExtension: () => ({ loseContext: () => undefined }) } as unknown as WebGLRenderingContext)
				: null;
		}
		return null;
	} as typeof HTMLCanvasElement.prototype.getContext;

	return () => {
		HTMLCanvasElement.prototype.getContext = original;
	};
}

/** Set viewport dimensions and fire a resize. */
export function setViewport(width: number, height: number) {
	vi.stubGlobal("innerWidth", width);
	vi.stubGlobal("innerHeight", height);
	window.dispatchEvent(new Event("resize"));
}

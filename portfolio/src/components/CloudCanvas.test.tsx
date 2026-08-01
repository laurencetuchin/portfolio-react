import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia, stubNavigator, stubWebGL } from "../test/testUtils";

/**
 * The lazy chunk must never be evaluated in these tests — that is the whole
 * point of the static tier. Mocking the module lets us detect whether the
 * factory was invoked at all.
 */
const sceneLoaded = vi.fn();
vi.mock("../three/CloudScene", () => {
	sceneLoaded();
	return { default: () => <div data-testid="cloud-scene" /> };
});

import CloudCanvas from "./CloudCanvas";

/** Render and let the lazy boundary settle, so Suspense resolves inside act(). */
async function renderSettled() {
	const result = render(<CloudCanvas />);
	await act(async () => {
		await Promise.resolve();
	});
	return result;
}

describe("CloudCanvas gating", () => {
	let restoreWebGL: (() => void) | null = null;

	afterEach(() => {
		restoreWebGL?.();
		restoreWebGL = null;
		vi.unstubAllGlobals();
		sceneLoaded.mockClear();
	});

	it("renders nothing when the visitor prefers reduced motion", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia("prefers-reduced-motion");
		stubNavigator({ hardwareConcurrency: 16 });

		const { container } = render(<CloudCanvas />);
		expect(container).toBeEmptyDOMElement();
	});

	it("never requests the WebGL chunk in the static tier", () => {
		// Stronger than "does not animate": the ~700 kB of three/drei must not
		// even be fetched. If this regresses, reduced-motion visitors still pay
		// the full download cost.
		restoreWebGL = stubWebGL(true);
		stubMatchMedia("prefers-reduced-motion");
		stubNavigator({ hardwareConcurrency: 16 });

		render(<CloudCanvas />);
		expect(sceneLoaded).not.toHaveBeenCalled();
	});

	it("renders nothing when WebGL is unavailable", () => {
		restoreWebGL = stubWebGL(false);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16 });

		const { container } = render(<CloudCanvas />);
		expect(container).toBeEmptyDOMElement();
		expect(sceneLoaded).not.toHaveBeenCalled();
	});

	it("renders nothing when Data Saver is enabled", () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, saveData: true });

		const { container } = render(<CloudCanvas />);
		expect(container).toBeEmptyDOMElement();
	});

	it("mounts the canvas wrapper on a capable device", async () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		await renderSettled();
		expect(screen.getByTestId("cloud-canvas")).toBeInTheDocument();
	});

	it("keeps the canvas out of the accessibility tree and pointer events", async () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		await renderSettled();
		const wrapper = screen.getByTestId("cloud-canvas");

		// Decorative: it must not be announced, and it must not swallow clicks
		// on the content sitting above it.
		expect(wrapper).toHaveAttribute("aria-hidden", "true");
		expect(wrapper.className).toMatch(/pointer-events-none/);
	});

	it("starts transparent and fades in once the scene reports ready", async () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		await renderSettled();
		// The mocked scene never calls onReady, so it stays hidden — proving the
		// clouds fade in over the gradient rather than popping into place.
		expect(screen.getByTestId("cloud-canvas").className).toMatch(/opacity-0/);
	});

	it("sits behind page content", async () => {
		restoreWebGL = stubWebGL(true);
		stubMatchMedia(null);
		stubNavigator({ hardwareConcurrency: 16, deviceMemory: 16 });
		vi.stubGlobal("innerWidth", 1440);

		await renderSettled();
		expect(screen.getByTestId("cloud-canvas").className).toMatch(/-z-10/);
	});
});

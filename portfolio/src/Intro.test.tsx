import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Intro from "./Intro";
import { stubMatchMedia } from "./test/testUtils";

describe("Intro", () => {
	beforeEach(() => {
		stubMatchMedia(null);
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("renders the name as the single h1", () => {
		render(<Intro />);
		const headings = screen.getAllByRole("heading", { level: 1 });
		expect(headings).toHaveLength(1);
		expect(headings[0]).toHaveTextContent("Laurence Tuchin");
	});

	it("renders the portrait with alt text and explicit dimensions", () => {
		render(<Intro />);
		const portrait = screen.getByAltText(/portrait of laurence tuchin/i);

		expect(portrait).toHaveAttribute("src", "/images/profile.png");
		// Explicit dimensions keep CLS at zero; the portrait is the largest
		// above-the-fold element.
		expect(portrait).toHaveAttribute("width");
		expect(portrait).toHaveAttribute("height");
	});

	it("does not lazy-load the portrait, which is above the fold", () => {
		render(<Intro />);
		expect(screen.getByAltText(/portrait of laurence tuchin/i)).not.toHaveAttribute(
			"loading",
			"lazy"
		);
	});

	it("exposes the interests to assistive tech as static text", () => {
		// The visible word mutates on a timer, so it is aria-hidden. The full
		// list has to be reachable some other way or the content is lost.
		render(<Intro />);
		const sr = screen.getByText(/i am passionate about .*snowboarding/i);
		expect(sr).toBeInTheDocument();
	});

	it("hides the animated word from screen readers", () => {
		const { container } = render(<Intro />);
		const animated = container.querySelector("[aria-hidden='true']");
		expect(animated).toBeInTheDocument();
	});

	it("reserves a fixed height for the rotating word", () => {
		// Without this the changing word resizes its line box and shoves the
		// CTA button down the page on every tick.
		const { container } = render(<Intro />);
		const slot = container.querySelector(".h-9");
		expect(slot).toBeInTheDocument();
	});

	it("links to email, LinkedIn and GitHub", () => {
		render(<Intro />);

		expect(screen.getByRole("link", { name: /contact me/i })).toHaveAttribute(
			"href",
			expect.stringContaining("mailto:laurencetuchin@gmail.com")
		);
		expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
			"href",
			"https://www.linkedin.com/in/laurencetuchin/"
		);
		expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
			"href",
			"https://github.com/laurencetuchin"
		);
	});

	it("opens external profile links safely", () => {
		render(<Intro />);
		for (const name of [/linkedin/i, /github/i]) {
			const link = screen.getByRole("link", { name });
			expect(link).toHaveAttribute("target", "_blank");
			expect(link.getAttribute("rel")).toMatch(/noreferrer/);
		}
	});
});

describe("Intro Tailwind safety", () => {
	it("writes the rotating word colours as complete literal class strings", () => {
		// Tailwind scans source text. A constructed name like `text-${hue}-500`
		// is never emitted, so the word renders unstyled in production while
		// looking correct in dev. This is the single nastiest footgun here.
		const source = readFileSync(resolve(__dirname, "Intro.tsx"), "utf8");

		const colorArray = source.match(/const wordColors[^=]*=\s*\[([\s\S]*?)\]/);
		if (!colorArray) throw new Error("wordColors array not found in Intro.tsx");

		const body = colorArray[1];
		expect(body).not.toMatch(/\$\{/);
		expect(body).not.toMatch(/`/);

		const entries = body.match(/"[^"]+"/g) ?? [];
		expect(entries.length).toBeGreaterThan(0);
		for (const entry of entries) {
			expect(entry).toMatch(/^"text-[a-z]+-\d{2,3}"$/);
		}
	});
});

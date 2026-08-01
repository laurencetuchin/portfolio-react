import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import Navbar from "./Navbar";
import { stubMatchMedia } from "./test/testUtils";

// jsdom cannot create a WebGL context, so the scene would never mount anyway;
// mocking keeps the failure explicit rather than incidental.
vi.mock("./three/CloudScene", () => ({ default: () => null }));

describe("App structure", () => {
	beforeEach(() => {
		stubMatchMedia(null);
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("renders every section the navbar links to", () => {
		const { container } = render(<App />);
		for (const id of ["intro", "about", "projects", "tech-stack"]) {
			expect(container.querySelector(`#${id}`), `missing #${id}`).toBeInTheDocument();
		}
	});

	it("gives each anchor target a unique id", () => {
		// About.tsx used to render its own <section id="about"> inside App's,
		// producing a duplicate id and an anchor that jumped to the wrong node.
		const { container } = render(<App />);
		const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("offsets every anchor target so the sticky navbar cannot cover it", () => {
		const { container } = render(<App />);
		for (const id of ["intro", "about", "projects", "tech-stack"]) {
			const section = container.querySelector(`#${id}`);
			expect(section?.className, `#${id} lacks scroll-mt`).toMatch(/scroll-mt-/);
		}
	});

	it("makes anchor targets focusable so keyboard focus follows the jump", () => {
		const { container } = render(<App />);
		for (const id of ["about", "projects", "tech-stack"]) {
			expect(container.querySelector(`#${id}`)).toHaveAttribute("tabindex", "-1");
		}
	});

	it("renders the hero outside the width-constrained main, for full bleed", () => {
		const { container } = render(<App />);
		const intro = container.querySelector("#intro");
		expect(intro?.closest("main")).toBeNull();
	});

	it("renders project cards from data", () => {
		render(<App />);
		expect(screen.getByText("Neuro Reader")).toBeInTheDocument();
		expect(screen.getByText("Solar Outdoor Light")).toBeInTheDocument();
		expect(screen.getByText("Employee Management System API")).toBeInTheDocument();
	});

	it("omits the open-source section while that list is empty", () => {
		render(<App />);
		expect(screen.queryByText(/open source contributions projects/i)).toBeNull();
	});

	it("lazy-loads below-the-fold project images", () => {
		render(<App />);
		const neuro = screen.getByAltText("Neuro Reader");
		expect(neuro).toHaveAttribute("loading", "lazy");
	});

	it("renders the decorative backdrop hidden from assistive tech", () => {
		const { container } = render(<App />);
		const hidden = container.querySelectorAll("[aria-hidden='true']");
		expect(hidden.length).toBeGreaterThan(0);
	});
});

describe("Navbar", () => {
	beforeEach(() => {
		stubMatchMedia(null);
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("links to each in-page section by hash", () => {
		render(<Navbar />);
		const nav = screen.getByRole("navigation");

		expect(within(nav).getByRole("link", { name: "About" })).toHaveAttribute(
			"href",
			"#about"
		);
		expect(within(nav).getByRole("link", { name: "Projects" })).toHaveAttribute(
			"href",
			"#projects"
		);
		expect(within(nav).getByRole("link", { name: "Tech Stack" })).toHaveAttribute(
			"href",
			"#tech-stack"
		);
	});

	it("reports the mobile menu state to assistive tech", async () => {
		const user = userEvent.setup();
		render(<Navbar />);

		const toggle = screen.getByRole("button", { name: /toggle menu/i });
		expect(toggle).toHaveAttribute("aria-expanded", "false");

		await user.click(toggle);
		expect(toggle).toHaveAttribute("aria-expanded", "true");
	});

	it("points aria-controls at the menu it actually opens", async () => {
		const user = userEvent.setup();
		const { container } = render(<Navbar />);

		const toggle = screen.getByRole("button", { name: /toggle menu/i });
		await user.click(toggle);

		const controlled = toggle.getAttribute("aria-controls");
		expect(controlled).toBeTruthy();
		expect(container.querySelector(`#${controlled}`)).toBeInTheDocument();
	});

	it("closes the mobile menu after a link is chosen", async () => {
		const user = userEvent.setup();
		const { container } = render(<Navbar />);

		const toggle = screen.getByRole("button", { name: /toggle menu/i });
		await user.click(toggle);

		// Scope to the mobile menu specifically — the desktop list renders the
		// same link labels.
		const menu = container.querySelector("#mobile-menu") as HTMLElement;
		expect(menu).toBeInTheDocument();

		await user.click(within(menu).getByRole("link", { name: "About" }));

		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(container.querySelector("#mobile-menu")).toBeNull();
	});
});

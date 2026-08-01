import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CLOUD_TEXTURE_URL } from "./cloudTexture";

const SRC = resolve(__dirname, "..");
const PROJECT = resolve(__dirname, "../..");

/**
 * Every non-test source file under src/.
 *
 * Test files are excluded deliberately: these scanners name the very hosts and
 * env vars they forbid, so including them would make the suite fail on itself.
 */
function sourceFiles(dir: string, exts = [".ts", ".tsx"]): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			out.push(...sourceFiles(full, exts));
		} else if (exts.includes(extname(entry)) && !/\.test\.tsx?$/.test(entry)) {
			out.push(full);
		}
	}
	return out;
}

describe("cloud texture wiring", () => {
	it("points at a local, root-relative path", () => {
		expect(CLOUD_TEXTURE_URL.startsWith("/")).toBe(true);
		expect(CLOUD_TEXTURE_URL).not.toMatch(/^https?:/);
	});

	it("resolves to a file that actually exists in public/", () => {
		// A typo here fails silently in the browser: drei suspends forever and
		// the sky is simply empty.
		const asset = join(PROJECT, "public", CLOUD_TEXTURE_URL);
		expect(() => readFileSync(asset)).not.toThrow();
	});

	it("is passed to <Clouds>, not to a bare <Cloud>", () => {
		// drei's CloudProps has no `texture` field — only CloudsProps does. A
		// <Cloud> outside a configured <Clouds> self-wraps in a default parent
		// and hotlinks the drei CDN.
		const layers = readFileSync(join(SRC, "three/CloudLayers.tsx"), "utf8");
		expect(layers).toMatch(/<Clouds[^>]*texture=/s);
	});
});

/**
 * Strip comments so these scanners test what the code *does*, not what the
 * documentation happens to mention. Several modules legitimately name the CDN
 * and OpenRouter in prose explaining why they are avoided.
 */
function stripComments(source: string) {
	return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("no third-party asset hosts", () => {
	it("never fetches from drei's CDN", () => {
		// The single most likely silent regression in this codebase: drop the
		// `texture` prop and drei falls back to rawcdn.githack.com. It looks fine
		// locally, leaks visitor IPs to a third party, and renders nothing at all
		// wherever that host is blocked.
		for (const file of sourceFiles(SRC)) {
			const code = stripComments(readFileSync(file, "utf8"));
			expect(code, `${file} fetches from drei's asset CDN`).not.toMatch(
				/githack\.com|drei-assets/
			);
		}
	});

	it("makes no runtime call to OpenRouter", () => {
		// The asset pipeline is a build-time script only. Runtime must never hold
		// an API key or call a generation endpoint.
		for (const file of sourceFiles(SRC)) {
			const code = stripComments(readFileSync(file, "utf8"));
			expect(code, `${file} calls OpenRouter`).not.toMatch(/openrouter\.ai/i);
			expect(code, `${file} reads an OpenRouter key`).not.toMatch(/OPENROUTER_API_KEY/);
		}
	});

	it("hotlinks no external image host at all", () => {
		// Broader net than the two cases above: any absolute http(s) URL used as
		// an asset would defeat the point of committing the texture locally.
		for (const file of sourceFiles(SRC)) {
			const code = stripComments(readFileSync(file, "utf8"));
			const assetUrls = code.match(
				/["'`]https?:\/\/[^"'`]+\.(png|jpe?g|webp|gif|svg|mp4|webm|hdr|exr)["'`]/gi
			);
			expect(assetUrls, `${file} hotlinks an external asset`).toBeNull();
		}
	});
});

describe("bundle isolation", () => {
	const THREE_IMPORT =
		/^\s*import\s+(?!type\b)[^;]*?from\s+["'](three|@react-three\/[^"']+)["']/gm;

	it("keeps three, fiber and drei imports inside src/three/", () => {
		// One stray `import { Vector3 } from "three"` in a DOM component pulls
		// ~700 kB into the entry chunk and quietly undoes the code splitting.
		const strays: string[] = [];

		for (const file of sourceFiles(SRC)) {
			if (file.includes(`${SRC}/three/`)) continue;
			if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;

			const contents = readFileSync(file, "utf8");
			if (contents.match(THREE_IMPORT)) strays.push(file);
		}

		expect(strays).toEqual([]);
	});

	it("loads the scene through a dynamic import, not a static one", () => {
		const canvas = readFileSync(join(SRC, "components/CloudCanvas.tsx"), "utf8");
		expect(canvas).toMatch(/lazy\(\s*\(\)\s*=>\s*import\(/);
		expect(canvas).not.toMatch(THREE_IMPORT);
	});
});

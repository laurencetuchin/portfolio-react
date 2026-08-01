#!/usr/bin/env node
/**
 * OPTIONAL asset upgrade pipeline. Regenerates the cloud sprite with an image
 * model via OpenRouter.
 *
 *   OPENROUTER_API_KEY=sk-or-... npm run assets:generate          # draft only
 *   OPENROUTER_API_KEY=sk-or-... npm run assets:generate -- --write
 *
 * INVARIANTS — do not weaken these:
 *
 *   1. The site NEVER calls OpenRouter at runtime and never hotlinks an
 *      external image host. This is a build-time tool whose only output is a
 *      committed PNG. Enforced by src/three/cloudTexture.test.ts.
 *   2. Without OPENROUTER_API_KEY this exits 0 immediately. It must never fail
 *      a build or block a contributor who does not have a key.
 *   3. Nothing under public/ is overwritten without an explicit --write.
 *      Drafts land in .asset-drafts/, which is gitignored.
 *
 * `scripts/` sits outside tsconfig's `include: ["src"]` and is imported by
 * nothing in src/, so this file cannot reach the Vite module graph.
 *
 * NOTE: this script has never been executed in CI or in the environment where
 * it was written — outbound access to openrouter.ai is blocked there. It is
 * shipped as a documented tool for running locally, and the committed
 * procedural texture from `npm run assets:texture` is what actually renders.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(HERE, "..");

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash-image";

const TARGETS = [
	{
		name: "cloud-puff.png",
		destination: "public/textures/cloud-puff.png",
		prompt: [
			"A single isolated cumulus cloud puff, soft feathered edges,",
			"pure white cloud on a pure black background, centred in frame,",
			"no horizon, no ground, no sky gradient, no other objects.",
			"Soft dreamy pastel lighting. Square image.",
		].join(" "),
		/** Image models return opaque RGB; a sprite needs alpha. */
		deriveAlphaFromLuminance: true,
	},
];

function parseArgs(argv) {
	return {
		write: argv.includes("--write"),
		dryRun: argv.includes("--dry-run"),
	};
}

async function requestImage({ apiKey, model, prompt }) {
	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
			"HTTP-Referer": "https://github.com/laurencetuchin/portfolio-react",
			"X-Title": "portfolio-react cloud assets",
		},
		body: JSON.stringify({
			model,
			modalities: ["image", "text"],
			messages: [{ role: "user", content: prompt }],
		}),
	});

	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new Error(`OpenRouter responded ${response.status}: ${detail.slice(0, 400)}`);
	}

	const payload = await response.json();
	const url = payload?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

	if (typeof url !== "string") {
		throw new Error("response contained no image; check the model supports image output");
	}

	const base64 = url.startsWith("data:") ? url.slice(url.indexOf(",") + 1) : null;
	if (!base64) throw new Error(`expected a data: URI, received ${url.slice(0, 60)}...`);

	return Buffer.from(base64, "base64");
}

/** Reject anything that is not actually a PNG before it reaches public/. */
function assertPng(buffer) {
	const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
	if (buffer.length < 1024) throw new Error(`suspiciously small (${buffer.length} bytes)`);
	if (!buffer.subarray(0, 8).equals(signature)) throw new Error("not a PNG");
}

/**
 * Alpha derivation needs pixel access, which means decoding a model-authored
 * PNG — more than the hand-rolled encoder in make-cloud-texture.mjs can do.
 * `sharp` is used if present but is deliberately NOT a dependency.
 */
async function deriveAlpha(buffer) {
	const sharp = await import("sharp").then((m) => m.default).catch(() => null);

	if (!sharp) {
		return {
			buffer,
			note: "sharp not installed — saved with the model's opaque background. Install sharp, or key the background out by hand, before using this as a sprite.",
		};
	}

	const { data, info } = await sharp(buffer)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	for (let i = 0; i < data.length; i += info.channels) {
		// Luminance of the model's white-on-black render becomes the alpha, and
		// the colour is forced to white so the scene tints the puff.
		const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
		data[i] = 255;
		data[i + 1] = 255;
		data[i + 2] = 255;
		data[i + 3] = Math.round(Math.min(255, Math.max(0, luminance)));
	}

	const out = await sharp(data, {
		raw: { width: info.width, height: info.height, channels: info.channels },
	})
		.png()
		.toBuffer();

	return { buffer: out, note: "alpha derived from luminance" };
}

async function main() {
	const { write, dryRun } = parseArgs(process.argv.slice(2));
	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		console.warn(
			"OPENROUTER_API_KEY is not set — skipping asset generation.\n" +
				"The committed texture from `npm run assets:texture` will be used."
		);
		process.exit(0);
	}

	const model = process.env.OPENROUTER_IMAGE_MODEL ?? DEFAULT_MODEL;
	const draftDir = join(PROJECT, ".asset-drafts");
	mkdirSync(draftDir, { recursive: true });

	for (const target of TARGETS) {
		console.log(`generating ${target.name} with ${model}...`);

		if (dryRun) {
			console.log(`  [dry run] prompt: ${target.prompt}`);
			continue;
		}

		let buffer = await requestImage({ apiKey, model, prompt: target.prompt });
		assertPng(buffer);

		if (target.deriveAlphaFromLuminance) {
			const processed = await deriveAlpha(buffer);
			buffer = processed.buffer;
			console.log(`  ${processed.note}`);
		}

		const draftPath = join(draftDir, target.name);
		writeFileSync(draftPath, buffer);
		console.log(`  draft written to ${draftPath}`);

		if (write) {
			const finalPath = join(PROJECT, target.destination);
			mkdirSync(dirname(finalPath), { recursive: true });
			writeFileSync(finalPath, buffer);
			console.log(`  installed to ${target.destination}`);
		} else {
			console.log("  pass --write to install it over the committed asset");
		}
	}
}

main().catch((error) => {
	console.error(`asset generation failed: ${error.message}`);
	process.exit(1);
});

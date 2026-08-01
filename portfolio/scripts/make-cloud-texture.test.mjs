import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { buildCloudTexture, encodePng } from "./make-cloud-texture.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const COMMITTED = resolve(HERE, "../public/textures/cloud-puff.png");
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Walk the PNG chunk structure so assertions describe real format properties. */
function parseChunks(png) {
	const chunks = [];
	let offset = 8; // past the signature
	while (offset < png.length) {
		const length = png.readUInt32BE(offset);
		const type = png.subarray(offset + 4, offset + 8).toString("ascii");
		const data = png.subarray(offset + 8, offset + 8 + length);
		chunks.push({ type, data });
		offset += 12 + length;
	}
	return chunks;
}

function decodeRgba(png) {
	const chunks = parseChunks(png);
	const ihdr = chunks.find((c) => c.type === "IHDR").data;
	const width = ihdr.readUInt32BE(0);
	const height = ihdr.readUInt32BE(4);

	const idat = Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.data));
	const raw = inflateSync(idat);

	const pixels = Buffer.alloc(width * height * 4);
	for (let y = 0; y < height; y++) {
		const rowStart = y * (1 + width * 4);
		// Filter byte must be 0 (None) — the encoder does not implement others.
		if (raw[rowStart] !== 0) throw new Error(`unexpected filter ${raw[rowStart]} on row ${y}`);
		raw.copy(pixels, y * width * 4, rowStart + 1, rowStart + 1 + width * 4);
	}

	const alphaAt = (x, y) => pixels[(y * width + x) * 4 + 3];
	return { width, height, pixels, alphaAt };
}

describe("PNG encoder", () => {
	it("emits a valid signature and the required chunks in order", () => {
		const png = buildCloudTexture();

		expect(png.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);

		const types = parseChunks(png).map((c) => c.type);
		expect(types[0]).toBe("IHDR");
		expect(types).toContain("IDAT");
		expect(types[types.length - 1]).toBe("IEND");
	});

	it("declares 8-bit RGBA, no interlacing", () => {
		const ihdr = parseChunks(buildCloudTexture()).find((c) => c.type === "IHDR").data;

		expect(ihdr.readUInt32BE(0)).toBe(256); // width
		expect(ihdr.readUInt32BE(4)).toBe(256); // height
		expect(ihdr[8]).toBe(8); // bit depth
		expect(ihdr[9]).toBe(6); // colour type RGBA — alpha is the whole point
		expect(ihdr[12]).toBe(0); // interlace off
	});

	it("writes a correct CRC for every chunk", () => {
		// A wrong CRC is the classic hand-rolled-PNG bug: many decoders ignore it,
		// so it survives a visual check and then fails in a stricter loader.
		const png = buildCloudTexture();
		const table = (() => {
			const t = new Int32Array(256);
			for (let n = 0; n < 256; n++) {
				let c = n;
				for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
				t[n] = c;
			}
			return t;
		})();
		const crc32 = (buf) => {
			let c = 0xffffffff;
			for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
			return (c ^ 0xffffffff) >>> 0;
		};

		let offset = 8;
		let checked = 0;
		while (offset < png.length) {
			const length = png.readUInt32BE(offset);
			const typeAndData = png.subarray(offset + 4, offset + 8 + length);
			const stored = png.readUInt32BE(offset + 8 + length);
			expect(crc32(typeAndData)).toBe(stored);
			checked++;
			offset += 12 + length;
		}
		expect(checked).toBe(3); // IHDR, IDAT, IEND
	});

	it("round-trips arbitrary pixel data", () => {
		const rgba = Buffer.from([
			255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 64, 255, 255, 255, 0,
		]);
		const decoded = decodeRgba(encodePng(rgba, 2, 2));

		expect(decoded.width).toBe(2);
		expect(decoded.height).toBe(2);
		expect(Buffer.from(decoded.pixels).equals(rgba)).toBe(true);
	});
});

describe("cloud puff texture", () => {
	it("is fully transparent at all four corners", () => {
		// Any alpha in the corners renders the sprite as a visible square once
		// instanced hundreds of times — the most obvious way this asset fails.
		const { alphaAt, width, height } = decodeRgba(buildCloudTexture());

		expect(alphaAt(0, 0)).toBe(0);
		expect(alphaAt(width - 1, 0)).toBe(0);
		expect(alphaAt(0, height - 1)).toBe(0);
		expect(alphaAt(width - 1, height - 1)).toBe(0);
	});

	it("is fully transparent along every border pixel", () => {
		const { alphaAt, width, height } = decodeRgba(buildCloudTexture());

		for (let x = 0; x < width; x++) {
			expect(alphaAt(x, 0)).toBe(0);
			expect(alphaAt(x, height - 1)).toBe(0);
		}
		for (let y = 0; y < height; y++) {
			expect(alphaAt(0, y)).toBe(0);
			expect(alphaAt(width - 1, y)).toBe(0);
		}
	});

	it("is substantially opaque at the centre", () => {
		const { alphaAt } = decodeRgba(buildCloudTexture());
		expect(alphaAt(128, 138)).toBeGreaterThan(200);
	});

	it("falls off monotonically enough to read as soft, not hard-edged", () => {
		const { alphaAt } = decodeRgba(buildCloudTexture());

		// Sample outward from the densest lobe toward the border. The gradient
		// should be gradual: a hard cutoff means the puffs look like coins.
		const centre = alphaAt(128, 138);
		const mid = alphaAt(128, 200);
		const outer = alphaAt(128, 240);

		expect(centre).toBeGreaterThan(mid);
		expect(mid).toBeGreaterThan(outer);
		expect(outer).toBeLessThan(40);
	});

	it("keeps RGB near white so the puffs tint from the scene, not the texture", () => {
		const { pixels } = decodeRgba(buildCloudTexture());
		const i = (138 * 256 + 128) * 4;

		expect(pixels[i]).toBeGreaterThan(240); // R
		expect(pixels[i + 1]).toBeGreaterThan(235); // G
		expect(pixels[i + 2]).toBeGreaterThan(240); // B
	});

	it("uses a meaningful share of the sprite area", () => {
		// Guards against a regression that shrinks the puff to a dot or blows it
		// out to fill the frame; either wrecks the instanced look.
		const { pixels } = decodeRgba(buildCloudTexture());

		let opaqueish = 0;
		for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 20) opaqueish++;

		const coverage = opaqueish / (256 * 256);
		expect(coverage).toBeGreaterThan(0.15);
		expect(coverage).toBeLessThan(0.6);
	});

	it("is deterministic across runs", () => {
		// The output is committed, so non-determinism would produce a spurious
		// diff on every developer's machine.
		expect(buildCloudTexture().equals(buildCloudTexture())).toBe(true);
	});

	it("matches the committed file, so the asset is never stale", () => {
		// If this fails, someone changed the generator without running
		// `npm run assets:texture`.
		expect(buildCloudTexture().equals(readFileSync(COMMITTED))).toBe(true);
	});
});

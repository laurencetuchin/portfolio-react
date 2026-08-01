#!/usr/bin/env node
/**
 * Generates the committed cloud puff sprite: public/textures/cloud-puff.png
 *
 *   npm run assets:texture
 *
 * Why this exists
 * ---------------
 * drei's <Clouds> defaults its `texture` prop to a rawcdn.githack.com URL. That
 * means the site would fetch its most important visual asset from a third-party
 * CDN on every page load — a privacy leak, a hard runtime dependency on a host
 * we do not control, and a silent blank-clouds failure anywhere that host is
 * blocked. This script produces a local replacement so nothing is hotlinked.
 *
 * Zero dependencies by design: the PNG is encoded here with node:zlib plus
 * hand-written IHDR/IDAT/IEND chunks. Adding `sharp` or `canvas` to build a
 * 256x256 sprite would be a heavy native dependency for ~120 lines of math.
 *
 * Output is fully deterministic — a fixed PRNG seed and integer-quantised
 * channels mean re-running never produces a spurious diff.
 *
 * Alternative considered: an SVG (feTurbulence + a radial-gradient mask) also
 * loads through three's TextureLoader and would be diffable text. PNG wins on
 * guaranteed, identical cross-browser rasterisation into a WebGL texture —
 * feTurbulence output is notoriously not pixel-identical between engines.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SIZE = 256;
const SEED = 0x5eed1e;

// ---------------------------------------------------------------- noise ----

/** Deterministic 32-bit PRNG. Same seed, same texture, forever. */
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const smoothstep = (edge0, edge1, x) => {
	const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
};

const lerp = (a, b, t) => a + (b - a) * t;

/** Value-noise lattice with wrapping, so octaves tile rather than seam. */
function makeLattice(rand, gridSize) {
	const g = new Float32Array(gridSize * gridSize);
	for (let i = 0; i < g.length; i++) g[i] = rand();
	return { g, gridSize };
}

function sampleLattice({ g, gridSize }, x, y) {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const xf = x - xi;
	const yf = y - yi;

	const wrap = (n) => ((n % gridSize) + gridSize) % gridSize;
	const at = (ix, iy) => g[wrap(iy) * gridSize + wrap(ix)];

	// Smoothstep interpolation keeps the noise C1-continuous; plain linear
	// interpolation leaves visible lattice creases at this magnification.
	const u = xf * xf * (3 - 2 * xf);
	const v = yf * yf * (3 - 2 * yf);

	return lerp(
		lerp(at(xi, yi), at(xi + 1, yi), u),
		lerp(at(xi, yi + 1), at(xi + 1, yi + 1), u),
		v
	);
}

function fbm(lattices, x, y) {
	let sum = 0;
	let amplitude = 1;
	let total = 0;
	let frequency = 1;

	for (const lattice of lattices) {
		sum += sampleLattice(lattice, x * frequency, y * frequency) * amplitude;
		total += amplitude;
		amplitude *= 0.5;
		frequency *= 2;
	}
	return sum / total;
}

// -------------------------------------------------------------- pixels ----

function renderPuff() {
	const rand = mulberry32(SEED);

	// Three octaves at increasing lattice density.
	const lattices = [makeLattice(rand, 4), makeLattice(rand, 8), makeLattice(rand, 16)];

	// A handful of overlapping lobes give a billowy silhouette instead of a
	// perfect circle, which reads as a soap bubble once instanced.
	const lobes = [
		{ x: 0.5, y: 0.54, r: 0.3 },
		{ x: 0.36, y: 0.6, r: 0.22 },
		{ x: 0.64, y: 0.6, r: 0.23 },
		{ x: 0.45, y: 0.42, r: 0.2 },
		{ x: 0.6, y: 0.45, r: 0.18 },
	];

	const rgba = Buffer.alloc(SIZE * SIZE * 4);

	for (let py = 0; py < SIZE; py++) {
		for (let px = 0; px < SIZE; px++) {
			const u = px / (SIZE - 1);
			const v = py / (SIZE - 1);

			// Union of soft lobes.
			let density = 0;
			for (const lobe of lobes) {
				const dx = u - lobe.x;
				const dy = v - lobe.y;
				const d = Math.sqrt(dx * dx + dy * dy);
				density = Math.max(density, smoothstep(lobe.r, lobe.r * 0.25, d));
			}

			// Break up the silhouette. Biased above 0.5 so the noise erodes edges
			// without punching holes through the middle.
			const n = fbm(lattices, u * 4, v * 4);
			density *= 0.55 + 0.75 * n;

			// Hard vignette to zero at the sprite border. A puff whose alpha is
			// non-zero at the edge shows as a visible square once instanced.
			const dxc = u - 0.5;
			const dyc = v - 0.5;
			const edge = smoothstep(0.5, 0.34, Math.sqrt(dxc * dxc + dyc * dyc));
			density *= edge;

			const alpha = Math.min(1, Math.max(0, density));

			// White core, faint lilac (#F6F0FF) creeping in at the thin edges, so
			// the puffs sit in the dream palette instead of reading as grey.
			const tint = 1 - alpha;
			const r = lerp(255, 246, tint * 0.55);
			const g = lerp(255, 240, tint * 0.55);
			const b = lerp(255, 255, tint * 0.55);

			const i = (py * SIZE + px) * 4;
			rgba[i] = Math.round(r);
			rgba[i + 1] = Math.round(g);
			rgba[i + 2] = Math.round(b);
			rgba[i + 3] = Math.round(alpha * 255);
		}
	}

	return rgba;
}

// ----------------------------------------------------------- png encode ----

const CRC_TABLE = (() => {
	const table = new Int32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		table[n] = c;
	}
	return table;
})();

function crc32(buf) {
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length, 0);

	const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);

	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(typeAndData), 0);

	return Buffer.concat([length, typeAndData, crc]);
}

export function encodePng(rgba, width, height) {
	// Each scanline is prefixed with its filter byte. Filter 0 (None) keeps this
	// encoder trivial; deflate still compresses the result well.
	const raw = Buffer.alloc(height * (1 + width * 4));
	for (let y = 0; y < height; y++) {
		const rowStart = y * (1 + width * 4);
		raw[rowStart] = 0;
		rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
	}

	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 6; // colour type: RGBA
	ihdr[10] = 0; // deflate
	ihdr[11] = 0; // adaptive filtering
	ihdr[12] = 0; // no interlace

	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk("IHDR", ihdr),
		chunk("IDAT", deflateSync(raw, { level: 9 })),
		chunk("IEND", Buffer.alloc(0)),
	]);
}

export function buildCloudTexture() {
	return encodePng(renderPuff(), SIZE, SIZE);
}

// ----------------------------------------------------------------- main ----

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
	const outPath = resolve(
		dirname(fileURLToPath(import.meta.url)),
		"../public/textures/cloud-puff.png"
	);
	mkdirSync(dirname(outPath), { recursive: true });

	const png = buildCloudTexture();
	writeFileSync(outPath, png);

	console.log(`wrote ${outPath} (${SIZE}x${SIZE}, ${(png.length / 1024).toFixed(1)} kB)`);
}

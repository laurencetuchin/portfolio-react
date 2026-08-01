/**
 * The single swap point for the cloud sprite.
 *
 * The committed default is generated offline and deterministically by
 * `npm run assets:texture` (scripts/make-cloud-texture.mjs) — no network, no
 * licence, no external host. To upgrade the look with a Higgsfield or
 * OpenRouter render, overwrite this same file; no code changes are needed.
 *
 * IMPORTANT: this URL must be passed to drei's <Clouds> parent, never a bare
 * <Cloud>. drei defaults `texture` to a rawcdn.githack.com URL, so a <Cloud>
 * without a configured <Clouds> ancestor silently fetches from that CDN at
 * runtime. See CloudLayers.tsx.
 */
export const CLOUD_TEXTURE_URL = "/textures/cloud-puff.png";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import type { Tier } from "../lib/capability";
import { observeScroll } from "../lib/scrollProgress";
import CameraRig from "./CameraRig";
import CloudLayers from "./CloudLayers";
import { qualityFor } from "./quality";

type CloudSceneProps = {
	tier: Tier;
	/** False when the hero is offscreen or the tab is hidden. */
	active: boolean;
	onReady?: () => void;
};

/**
 * Root of the lazily-loaded WebGL chunk. Nothing outside src/three imports
 * three, fiber or drei statically — that is what keeps ~700 kB out of the
 * entry bundle.
 */
export default function CloudScene({ tier, active, onReady }: CloudSceneProps) {
	const quality = qualityFor(tier);

	useEffect(() => observeScroll(), []);

	return (
		<Canvas
			frameloop={active ? "always" : "never"}
			dpr={[1, quality.dpr]}
			gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
			camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 60 }}
			// The canvas is position: fixed and never moves relative to the viewport,
			// so react-use-measure's scroll tracking buys nothing, and debouncing only
			// delays the first measurement (and with it renderer creation).
			resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
			className="pointer-events-none"
			onCreated={() => onReady?.()}
		>
			{/* useTexture inside <Clouds> suspends, so this boundary is required. */}
			<Suspense fallback={null}>
				<CameraRig enablePointer={quality.enablePointer} />
				<CloudLayers quality={quality} />
			</Suspense>
		</Canvas>
	);
}

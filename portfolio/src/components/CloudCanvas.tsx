import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useTier } from "../lib/capability";

/**
 * The lazy boundary. This module must never import three, fiber or drei —
 * statically or otherwise — or the WebGL bundle lands in the entry chunk.
 */
const CloudScene = lazy(() => import("../three/CloudScene"));

type CloudCanvasProps = {
	/** Element whose visibility gates rendering. Defaults to the hero. */
	targetId?: string;
};

export default function CloudCanvas({ targetId = "intro" }: CloudCanvasProps) {
	const tier = useTier();
	const [active, setActive] = useState(true);
	const [ready, setReady] = useState(false);
	const mounted = useRef(true);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	// Stop producing frames when the hero is scrolled past or the tab is hidden.
	// A cloud field animating behind the footer is pure battery burn.
	useEffect(() => {
		if (tier === "static") return;

		const target = document.getElementById(targetId);
		let visible = true;

		const sync = () => setActive(visible && !document.hidden);

		const observer =
			target && typeof IntersectionObserver !== "undefined"
				? new IntersectionObserver(
						(entries) => {
							visible = entries.some((entry) => entry.isIntersecting);
							sync();
						},
						{ rootMargin: "10% 0px" }
					)
				: null;

		observer?.observe(target as Element);
		document.addEventListener("visibilitychange", sync);

		return () => {
			observer?.disconnect();
			document.removeEventListener("visibilitychange", sync);
		};
	}, [tier, targetId]);

	// The static tier never constructs the lazy element, so the WebGL chunk is
	// not merely unrendered — it is never requested. That is the strongest form
	// of the reduced-motion guarantee, and it is what the tests assert.
	if (tier === "static") return null;

	return (
		<div
			aria-hidden="true"
			data-testid="cloud-canvas"
			className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000 ${
				ready ? "opacity-100" : "opacity-0"
			}`}
		>
			<Suspense fallback={null}>
				<CloudScene
					tier={tier}
					active={active}
					onReady={() => {
						if (mounted.current) setReady(true);
					}}
				/>
			</Suspense>
		</div>
	);
}

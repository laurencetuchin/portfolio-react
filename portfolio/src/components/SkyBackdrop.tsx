/**
 * The pure-CSS sky. Always rendered, behind everything.
 *
 * This is three things at once:
 *   1. the first-paint layer, before the WebGL chunk has downloaded,
 *   2. the permanent visual for the `static` tier (no WebGL / reduced motion),
 *   3. the depth backdrop the cloud field composites over.
 *
 * Because of (2) it has to look finished on its own, not like a loading state.
 */
export default function SkyBackdrop() {
	return (
		<div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			{/* Dawn gradient */}
			<div className="absolute inset-0 bg-dream-dawn" />

			{/* Soft pastel masses. Staggered durations keep them from pulsing in unison. */}
			<div className="absolute -left-[15%] top-[-10%] h-[65vh] w-[65vh] rounded-full bg-blush-200/70 blur-3xl motion-safe:animate-drift" />
			<div
				className="absolute right-[-12%] top-[8%] h-[55vh] w-[55vh] rounded-full bg-cloud-400/60 blur-3xl motion-safe:animate-drift"
				style={{ animationDuration: "34s", animationDelay: "-8s" }}
			/>
			<div
				className="absolute bottom-[6%] left-[18%] h-[50vh] w-[50vh] rounded-full bg-dream-200/70 blur-3xl motion-safe:animate-drift"
				style={{ animationDuration: "42s", animationDelay: "-16s" }}
			/>
			<div
				className="absolute bottom-[-12%] right-[10%] h-[45vh] w-[45vh] rounded-full bg-peach-200/60 blur-3xl motion-safe:animate-drift"
				style={{ animationDuration: "38s", animationDelay: "-24s" }}
			/>

			{/* Fine grain — stops the large gradients from banding on 8-bit displays. */}
			<svg className="absolute inset-0 h-full w-full opacity-[0.035]" aria-hidden="true">
				<filter id="dream-grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
				</filter>
				<rect width="100%" height="100%" filter="url(#dream-grain)" />
			</svg>
		</div>
	);
}

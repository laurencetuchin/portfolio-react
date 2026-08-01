import { useRotatingWord } from "./hooks/useRotatingWord";

const interests: string[] = [
	"improving",
	"snowboarding",
	"learning",
	"great UX + UI",
	"soccer",
	"optimising solutions",
	"tailwindcss",
	"java + spring",
	"react",
	"javaScript + typescript",
	"debugging",
	"growth mindset",
	"meeting new people",
	"teamwork",
	"outdoor adventures",
	"travel",
	"movies",
	"fitness",
];

/*
 * Complete literal class strings, never interpolated.
 *
 * Tailwind's scanner reads source text, so a constructed name like
 * `text-${hue}-500` is not emitted and the word renders unstyled in production
 * while looking fine in dev. Guarded by Intro.test.tsx.
 *
 * All of these clear 3:1 against the glass surface at the size they are used
 * (text-2xl bold), which is the AA threshold for large text.
 */
const wordColors: string[] = [
	"text-dream-700",
	"text-blush-500",
	"text-dream-600",
	"text-dream-500",
	"text-blush-400",
	"text-dream-800",
];

export default function Intro() {
	const { word, index, isPaused } = useRotatingWord(interests);
	const colorClass = wordColors[index % wordColors.length];

	return (
		<div className="grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-24">
			{/* Left: text content */}
			<div className="flex flex-col justify-center">
				<p className="font-medium tracking-wide text-dream-700">Helloooo I'm</p>
				<h1 className="text-4xl font-bold tracking-tight text-dream-900 sm:text-5xl">
					Laurence Tuchin
				</h1>
				<h2 className="mt-1 text-lg font-medium tracking-tight text-dream-800 sm:text-xl">
					Junior Software Developer
				</h2>

				<h2 className="mt-6 text-lg font-medium tracking-tight text-dream-700 sm:text-xl">
					I am passionate about
				</h2>

				{/*
				 * Fixed height so the changing word cannot shove the CTA around —
				 * the original shifted layout on every tick.
				 *
				 * aria-hidden because a text node mutating on a timer is announced
				 * over and over; the full list is exposed once, statically, below.
				 */}
				<p className="block h-9 overflow-hidden">
					<span
						key={index}
						aria-hidden="true"
						className={`inline-block text-2xl font-bold capitalize tracking-tight transition-opacity duration-500 ${colorClass} ${
							isPaused ? "" : "motion-safe:animate-fade-up"
						}`}
					>
						{word}
					</span>
				</p>
				<span className="sr-only-text">
					I am passionate about {interests.join(", ")}.
				</span>

				<div className="mt-8">
					<a
						href="mailto:laurencetuchin@gmail.com?subject=Hello Laurence&body=Hello, my name is "
						className="inline-block rounded-full bg-dream-800 px-7 py-3 text-base font-bold text-cloud-100 shadow-dream transition-all hover:bg-dream-900 hover:shadow-glow"
					>
						Contact me
					</a>

					<ul className="mt-8 flex gap-5">
						<li>
							<a
								href="https://www.linkedin.com/in/laurencetuchin/"
								target="_blank"
								rel="noreferrer"
								aria-label="LinkedIn"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 fill-dream-600 transition-colors hover:fill-dream-800"
									viewBox="0 0 24 24"
								>
									<path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
								</svg>
							</a>
						</li>
						<li>
							<a
								href="https://github.com/laurencetuchin"
								target="_blank"
								rel="noreferrer"
								aria-label="GitHub"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 fill-dream-600 transition-colors hover:fill-dream-800"
									viewBox="0 0 24 24"
								>
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Right: portrait, sitting in the clouds rather than on top of them */}
			<div className="flex items-center justify-center py-8">
				<div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
					{/* Soft auras replace the original hard concentric rings */}
					<div className="absolute inset-[-14%] rounded-full bg-gradient-to-br from-blush-200 via-cloud-200 to-dream-200 opacity-70 blur-2xl motion-safe:animate-pulse-soft" />
					<div
						className="absolute inset-[-4%] rounded-full bg-gradient-to-tr from-peach-200 to-dream-100 opacity-60 blur-xl motion-safe:animate-pulse-soft"
						style={{ animationDuration: "11s", animationDelay: "-3s" }}
					/>
					<img
						src="/images/profile.png"
						alt="Portrait of Laurence Tuchin"
						width={256}
						height={256}
						decoding="async"
						className="relative z-10 h-56 w-56 rounded-full object-cover shadow-dream ring-1 ring-white/70 motion-safe:animate-float sm:h-64 sm:w-64"
					/>
				</div>
			</div>
		</div>
	);
}

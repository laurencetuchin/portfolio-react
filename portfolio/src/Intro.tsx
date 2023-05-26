import { useEffect, useState } from "react";

export default function Intro() {
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
	];
	const [currentWord, setCurrentWord] = useState(interests[0]);
	const [currentColorClass, setCurrentColorClass] = useState("");

	// Iterates through word list and time is randomly generated so its less boring.
	useEffect(() => {
		const getRandomTime = () => {
			return 500; // Generate a random time between 0.2s and 1.5s in milliseconds
		};

		const interval = setInterval(() => {
			const currentIndex = interests.indexOf(currentWord);
			const nextIndex = (currentIndex + 1) % interests.length;
			setCurrentWord(interests[nextIndex]);
		}, getRandomTime());

		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentWord]);

	// Updates colour for each word randomly
	// Possibly add in fast colour loop through useEffect weight 50-900 and then change color on word change
	useEffect(() => {
		const colors = [
			"text-slate-500",
			"text-gray-500",
			"text-zinc-500",
			"text-neutral-500",
			"text-stone-500",
			"text-red-500",
			"text-orange-500",
			"text-amber-500",
			"text-yellow-500",
			"text-lime-500",
			"text-green-500",
			"text-emerald-500",
			"text-teal-500",
			"text-cyan-500",
			"text-sky-500",
			"text-blue-500",
			"text-indigo-500",
			"text-violet-500",
			"text-purple-500",
			"text-fuchsia-500",
			"text-pink-500",
			"text-rose-500",
		];

		// Find the index of the current color class
		const currentIndex = colors.findIndex(
			(color) => color === currentColorClass
		);

		// Calculate the next index based on the current index
		const nextIndex = (currentIndex + 1) % colors.length;

		// Get the next color class
		const nextColorClass = colors[nextIndex];

		setCurrentColorClass(nextColorClass);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentWord]);

	return (
		<div className="grid grid-cols-2">
			<div className="py-12 sm:py-8 md:py-12 lg:py-12 xl:py-12 2xl:py-28">
				<p className="font-medium text-slate-600">Helloooo I'm</p>
				<h1 className="text-4xl font-bold tracking-tight text-slate-700">
					Laurence Tuchin
				</h1>
				<h2 className=" text-lg font-medium tracking-tight text-slate-800 sm:text-xl">
					Junior Software Developer
				</h2>
				<h2 className="mt-3 text-lg font-medium tracking-tight text-slate-500 sm:text-xl">
					I am passionate about
				</h2>
				<p
					className={`text-xl font-bold capitalize tracking-tight ${currentColorClass}`}>
					{currentWord}
				</p>
				<div className="py-6">
					<button className="rounded-md border-0 border-current  bg-sky-200 text-lg font-bold text-slate-900 hover:bg-sky-300">
						Contact me
					</button>
					<ul className="flex justify-center py-6">
						<li className="mr-5 text-xs">
							<a
								href="https://www.linkedin.com/in/laurencetuchin/"
								target="_blank"
								rel="noreferrer">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 fill-slate-500 hover:fill-slate-700"
									viewBox="0 0 24 24">
									<path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
								</svg>
							</a>
							<span className="sr-only">LinkedIn</span>
						</li>
						<li className="mr-5 text-xs">
							<a
								href="https://github.com/laurencetuchin"
								target="_blank"
								rel="noreferrer">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 fill-slate-500 hover:fill-slate-700"
									viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</a>
							<span className="sr-only">GitHub</span>
						</li>
					</ul>
				</div>
			</div>
			<div className="py-12 sm:py-8 md:py-12 lg:py-12 xl:py-12 2xl:py-28">
				<div className="relative">
					<img
						src="src/images/profile.png"
						alt="Portfolio Profile photo of Laurence"
						className="absolute h-auto max-w-full shadow-xl  drop-shadow-2xl"
					/>
					<div className=" inset-10 flex items-center justify-center">
						<div className="h-80 w-80 rounded-full bg-yellow-500">
							<div className="h-24 w-24 rounded-full bg-orange-500">
								<div className="h-64 w-64 rounded-full bg-red-500"></div>
							</div>
							<div className="h-24 w-24 rounded-full bg-red-500"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

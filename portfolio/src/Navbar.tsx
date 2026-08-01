import { useState } from "react";

const navLinks = [
	{ label: "About", href: "#about" },
	{ label: "Projects", href: "#projects" },
	{ label: "Tech Stack", href: "#tech-stack" },
	{
		label: "Contact",
		href: "mailto:laurencetuchin@gmail.com?subject=Hello Laurence&body=Hello, my name is ",
	},
];

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-white/50 bg-cloud-200/60 shadow-lift backdrop-blur-xl">
			<nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
				<a
					href="#intro"
					className="text-lg font-bold tracking-tight text-dream-900 transition-colors hover:text-dream-700"
				>
					Laurence Tuchin
				</a>

				{/* Desktop links */}
				<ul className="hidden gap-8 md:flex">
					{navLinks.map((link) => (
						<li key={link.label}>
							<a
								href={link.href}
								className="text-sm font-medium text-dream-700 transition-colors hover:text-dream-900"
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>

				{/* Mobile hamburger */}
				<button
					className="flex flex-col gap-1.5 md:hidden"
					onClick={() => setMenuOpen((prev) => !prev)}
					aria-label="Toggle menu"
					aria-expanded={menuOpen}
					aria-controls="mobile-menu"
				>
					<span className="block h-0.5 w-6 bg-dream-800" />
					<span className="block h-0.5 w-6 bg-dream-800" />
					<span className="block h-0.5 w-6 bg-dream-800" />
				</button>
			</nav>

			{/* Mobile dropdown */}
			{menuOpen && (
				<ul
					id="mobile-menu"
					className="flex flex-col border-t border-white/50 bg-cloud-200/80 px-6 py-4 backdrop-blur-xl md:hidden"
				>
					{navLinks.map((link) => (
						<li key={link.label}>
							<a
								href={link.href}
								onClick={() => setMenuOpen(false)}
								className="block py-2 text-sm font-medium text-dream-700 transition-colors hover:text-dream-900"
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>
			)}
		</header>
	);
}

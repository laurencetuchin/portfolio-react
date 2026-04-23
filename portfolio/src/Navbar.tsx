import { useState } from "react";

const navLinks = [
	{ label: "About", href: "#about" },
	{ label: "Projects", href: "#projects" },
	{ label: "Tech Stack", href: "#tech-stack" },
	{ label: "Contact", href: "mailto:laurencetuchin@gmail.com?subject=Hello Laurence&body=Hello, my name is " },
];

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur">
			<nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
				<a href="#intro" className="text-lg font-bold text-slate-800 hover:text-slate-600">
					Laurence Tuchin
				</a>

				{/* Desktop links */}
				<ul className="hidden gap-8 md:flex">
					{navLinks.map((link) => (
						<li key={link.label}>
							<a
								href={link.href}
								className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
								{link.label}
							</a>
						</li>
					))}
				</ul>

				{/* Mobile hamburger */}
				<button
					className="flex flex-col gap-1.5 md:hidden"
					onClick={() => setMenuOpen((prev) => !prev)}
					aria-label="Toggle menu">
					<span className="block h-0.5 w-6 bg-slate-700" />
					<span className="block h-0.5 w-6 bg-slate-700" />
					<span className="block h-0.5 w-6 bg-slate-700" />
				</button>
			</nav>

			{/* Mobile dropdown */}
			{menuOpen && (
				<ul className="flex flex-col border-t border-slate-100 bg-white px-6 py-4 md:hidden">
					{navLinks.map((link) => (
						<li key={link.label}>
							<a
								href={link.href}
								onClick={() => setMenuOpen(false)}
								className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
								{link.label}
							</a>
						</li>
					))}
				</ul>
			)}
		</header>
	);
}

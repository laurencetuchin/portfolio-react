const techs = [
	"React",
	"JavaScript",
	"TypeScript",
	"Java",
	"Spring",
	"Hibernate",
	"PostgreSQL",
	"HTML5",
	"CSS3",
	"TailwindCSS",
	"Git",
	"Postman",
	"JUnit",
	"Bootstrap",
];

export default function TechStack() {
	return (
		<div className="py-12">
			<h2 className="mb-6 text-xl font-bold uppercase tracking-wide text-dream-700 md:text-2xl">
				Tech Stack
			</h2>
			<ul className="flex flex-wrap gap-3">
				{techs.map((tech, index) => (
					<li
						key={tech}
						style={{ animationDelay: `${index * 45}ms` }}
						className="inline-flex items-center rounded-full bg-cloud-200/70 px-4 py-2 text-sm font-medium text-dream-800 shadow-lift ring-1 ring-white/70 backdrop-blur-sm motion-safe:animate-fade-up"
					>
						{tech}
					</li>
				))}
			</ul>
		</div>
	);
}

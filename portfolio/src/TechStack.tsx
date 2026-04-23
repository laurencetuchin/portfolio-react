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
			<h2 className="mb-6 text-xl font-bold uppercase tracking-tight text-slate-600 md:text-2xl">
				Tech Stack
			</h2>
			<ul className="flex flex-wrap gap-3">
				{techs.map((tech) => (
					<li
						key={tech}
						className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
						{tech}
					</li>
				))}
			</ul>
		</div>
	);
}

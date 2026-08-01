interface Project {
	title: string;
	description: string;
	usedTech: string[];
	imageUrl?: string;
	github: string;
	deployedLink?: string;
}

interface ProjectsProps {
	projects: Project[];
	type: string;
}

const Projects: React.FC<ProjectsProps> = ({ projects, type }) => {
	return (
		<section className="py-8 md:py-16">
			<div className="pb-12">
				<h2 className="mb-10 text-xl font-bold uppercase tracking-wide text-dream-700 md:text-2xl">
					{type} Projects
				</h2>
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{projects.map((project, index) => (
						<div
							className="glass flex flex-col p-6 transition-shadow hover:shadow-glow"
							key={index}
						>
							{project.imageUrl ? (
								<img
									src={project.imageUrl}
									alt={project.title}
									width={640}
									height={352}
									// Every project card is below the fold. Explicit dimensions
									// also keep CLS at zero while the images stream in.
									loading="lazy"
									decoding="async"
									className="mb-4 h-44 w-full rounded-2xl object-cover"
								/>
							) : (
								<div className="mb-4 flex h-44 items-center justify-center rounded-2xl bg-dream-100 text-4xl font-bold text-dream-300">
									{project.title.charAt(0)}
								</div>
							)}
							<h3 className="mb-2 text-lg font-semibold tracking-tight text-dream-900">
								{project.title}
							</h3>
							<p className="flex-1 text-sm leading-relaxed tracking-tight text-dream-800">
								{project.description}
							</p>
							<div className="mt-4">
								<h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-dream-700">
									Technologies
								</h4>
								<ul className="flex flex-wrap gap-1">
									{project.usedTech.map((tech, i) => (
										<li
											key={i}
											className="rounded-full bg-dream-100 px-2 py-0.5 text-xs font-medium capitalize text-dream-700"
										>
											{tech}
										</li>
									))}
								</ul>
							</div>
							<div className="mt-4 flex gap-4">
								<a
									href={project.github}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-semibold text-dream-700 hover:underline"
								>
									GitHub
								</a>
								{project.deployedLink && (
									<a
										href={project.deployedLink}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm font-semibold text-dream-700 hover:underline"
									>
										Live Demo
									</a>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Projects;

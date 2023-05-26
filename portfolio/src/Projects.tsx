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
		<>
			<section className="py-8 md:py-16 lg:py-24">
				<div className="mx-auto px-4 pb-12">
					<h2 className="mb-10 text-xl font-bold capitalize md:text-center md:text-2xl">
						{type} Projects
					</h2>
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{projects.map((project, index) => (
							<div className="rounded bg-white p-6 shadow-md" key={index}>
								{project.imageUrl ? (
									<img
										src={project.imageUrl}
										alt={project.title}
										className="mb-4 w-full rounded"
									/>
								) : (
									""
								)}
								<h3 className="mb-2 text-lg font-semibold">{project.title}</h3>
								<p className="text-gray-600">{project.description}</p>
								<div>
									<h4 className="mt-4 font-semibold text-gray-800">
										Technologies:
									</h4>
									<ul className="ml-6 list-disc capitalize">
										{project.usedTech.map((tech, i) => (
											<li key={i}>{tech}</li>
										))}
									</ul>
								</div>
								<div className="mt-4">
									<a
										href={project.github}
										target="_blank"
										rel="noopener noreferrer"
										className="mr-2 text-blue-600 hover:underline">
										GitHub
									</a>
									{project.deployedLink ? (
										<a
											href={project.deployedLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline">
											Live Demo
										</a>
									) : (
										""
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
};

export default Projects;

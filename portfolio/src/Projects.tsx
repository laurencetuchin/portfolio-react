interface Project {
	title: string;
	description: string;
	usedTech: string[];
	imageUrl: string;
}

interface ProjectProps {
	projects: Project[];
}

const Projects: React.FC<ProjectProps> = ({ projects }) => {
	return (
		<>
			<section className="py-8">
				<h2 className="mb-4 text-2xl font-bold">Portfolio</h2>
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{projects.map((project, index) => (
						<div className="rounded bg-white p-6 shadow-md" key={index}>
							<img
								src={project.imageUrl}
								alt={project.title}
								className="mb-4 w-full rounded"
							/>
							<h3 className="mb-2 text-lg font-semibold">{project.title}</h3>
							<p className="text-gray-600">{project.description}</p>
							<div>
								<h4 className="mt-4 font-semibold text-gray-800">
									Technologies:
								</h4>
								<ul className="ml-6 list-disc">
									{project.usedTech.map((tech, i) => (
										<li key={i}>{tech}</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
			</section>
		</>
	);
};

export default Projects;

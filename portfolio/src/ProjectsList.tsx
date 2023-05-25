import Projects from "./Projects";

export default function ProjectsList() {
	const projects = [
		{
			title: "Project 1",
			description: "Description of project 1",
			usedTech: ["react", "typescript, tailwind"],
			imageUrl: "https://image.com/1",
		},
		{
			title: "Project 2",
			description: "Description of project 2",
			usedTech: ["react", "typescript, tailwind"],
			imageUrl: "https://image.com/2",
		},
		{
			title: "Project 3",
			description: "Description of project 3",
			usedTech: ["react", "typescript, tailwind"],
			imageUrl: "https://image.com/3",
		},
	];
	return (
		<div>
			<Projects projects={projects: Project} />
		</div>
	);
}

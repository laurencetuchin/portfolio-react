import "tailwindcss/tailwind.css";
import "./App.css";
import Intro from "./Intro";
import Projects from "./Projects";

const App: React.FC = () => {
	const projects = [
		{
			title: "NeuroReader",
			description:
				"Assists readers with customised formatting after they input text",
			usedTech: ["react", "typescript", "tailwind", "tss"],
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
		<>
			<div></div>
			<Intro />
			<Projects projects={projects} />
		</>
	);
};

export default App;

import "tailwindcss/tailwind.css";
import About from "./About";
import "./App.css";
import Intro from "./Intro";
import Projects from "./Projects";
import TechStack from "./TechStack";

const App: React.FC = () => {
	const personalProjects = [
		{
			title: "NeuroReader",
			description:
				"Assists readers with customised formatting after they input text",
			usedTech: ["react", "typescript", "tailwind", "tss"],
			imageUrl: "/src/images/neuro.gif",
			github: "https://github.com/laurencetuchin/neuroreader",
			deployedLink: "https://neuro-reader.netlify.app/",
		},
		{
			title: "Project 2",
			description: "Description of project 2",
			usedTech: ["react", "typescript, tailwind"],
			imageUrl: "https://image.com/2",
			github: "http",
			deployedLink: "http",
		},
		{
			title: "Project 3",
			description: "Description of project 3",
			usedTech: ["react", "typescript, tailwind"],
			imageUrl: "https://image.com/3",
			github: "http",
			deployedLink: "http",
		},
	];

	const openSourceProjects = [
		{
			title: "NeuroReader",
			description:
				"Assists readers with customised formatting after they input text",
			usedTech: ["react", "typescript", "tailwind", "tss"],
			github: "https://github.com/laurencetuchin/neuroreader",
		},
		{
			title: "Project 2",
			description: "Description of project 2",
			usedTech: ["react", "typescript, tailwind"],
			github: "http",
		},
		{
			title: "Project 3",
			description: "Description of project 3",
			usedTech: ["react", "typescript, tailwind"],
			github: "http",
		},
	];

	return (
		<>
			<div></div>
			<Intro />
			<About />
			<Projects projects={personalProjects} type={"Personal"} />
			<Projects
				projects={openSourceProjects}
				type={"Open source contributions"}
			/>
			<TechStack />
		</>
	);
};

export default App;

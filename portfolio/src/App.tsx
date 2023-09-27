import "tailwindcss/tailwind.css";
import About from "./About";
import "./App.css";
import Intro from "./Intro";
import Projects from "./Projects";
import TechStack from "./TechStack";

const App: React.FC = () => {
	const personalProjects = [
		{
			title: "Neuro Reader",
			description:
				"Assists readers with customised formatting after they input text. The text is transformed based on the users preferences and is output in a more readable format. It uses the useContext and useReducer API for state management. ",
			usedTech: ["react", "javascript", "tailwindcss"],
			imageUrl: "/images/neuro.gif",
			github: "https://github.com/laurencetuchin/neuroreader",
			deployedLink: "https://neuro-reader.netlify.app/",
		},
		{
			title: "Solar Outdoor Light",
			description:
				"Basic product landing page using an Aliexpress product. Various interactive elements on the page including a countdown timer, product delivery calculator and glowing light elements. Responsive design.",
			usedTech: ["html5", "css3", "javascipt", "bootstrap"],
			imageUrl: "/images/solar-outdoor-light.png",
			github: "https://github.com/laurencetuchin/solarlight",
			deployedLink: "https://solar-garden-light.netlify.app/",
		},
		{
			title: "Employee Management System API",
			description:
				"Our employee management system is designed to help managers keep track of important employee information and streamline team collaboration. With this system, managers can easily access and update employee profiles, track employment status, and set career goals.",
			usedTech: [
				"Java",
				"spring",
				"hibernate",
				"JUnit",
				"Postman",
				"PostgreSQL",
			],
			imageUrl: "",
			github: "https://github.com/laurencetuchin/employee-system-api",
			deployedLink: "https://github.com/laurencetuchin/employee-system-api",
		},
	];

	const openSourceProjects = [
		{
			title: "Neuro Reader",
			description:
				"Assists readers with customised formatting after they input text",
			usedTech: ["react", "javascript", "tailwindcss", "tss"],
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

import About from "./About";
import CloudCanvas from "./components/CloudCanvas";
import SkyBackdrop from "./components/SkyBackdrop";
import Footer from "./Footer";
import Intro from "./Intro";
import Navbar from "./Navbar";
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
			usedTech: ["html5", "css3", "javascript", "bootstrap"],
			imageUrl: "/images/solar-outdoor-light.png",
			github: "https://github.com/laurencetuchin/solarlight",
			deployedLink: "https://solar-garden-light.netlify.app/",
		},
		{
			title: "Employee Management System API",
			description:
				"Our employee management system is designed to help managers keep track of important employee information and streamline team collaboration. With this system, managers can easily access and update employee profiles, track employment status, and set career goals.",
			usedTech: ["Java", "spring", "hibernate", "JUnit", "Postman", "PostgreSQL"],
			github: "https://github.com/laurencetuchin/employee-system-api",
		},
	];

	// Add your open source contributions here
	const openSourceProjects: typeof personalProjects = [];

	return (
		<>
			<SkyBackdrop />
			<CloudCanvas targetId="intro" />
			<Navbar />

			{/*
			 * The hero is full-bleed so the cloud field reads edge to edge; only
			 * its inner container is constrained.
			 *
			 * Every section carries scroll-mt-24 because the sticky navbar would
			 * otherwise cover the heading an anchor link jumps to, and tabIndex
			 * so keyboard focus follows that jump.
			 */}
			<section
				id="intro"
				tabIndex={-1}
				className="relative z-10 min-h-[100svh] scroll-mt-24 px-6"
			>
				<div className="mx-auto max-w-5xl">
					<Intro />
				</div>
			</section>

			<main className="relative z-10 mx-auto max-w-5xl px-6">
				<section id="about" tabIndex={-1} className="scroll-mt-24">
					<About />
				</section>
				<section id="projects" tabIndex={-1} className="scroll-mt-24">
					<Projects projects={personalProjects} type={"Personal"} />
					{openSourceProjects.length > 0 && (
						<Projects
							projects={openSourceProjects}
							type={"Open source contributions"}
						/>
					)}
				</section>
				<section id="tech-stack" tabIndex={-1} className="scroll-mt-24">
					<TechStack />
				</section>
			</main>
			<Footer />
		</>
	);
};

export default App;

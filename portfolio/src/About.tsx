export default function About() {
	// No id here: App.tsx already wraps this in <section id="about">. Having it
	// in both places produced a duplicate id, which is invalid HTML and made the
	// navbar anchor jump to whichever the browser found first.
	return (
		<div className="py-12 md:py-20">
			<h2 className="mb-8 text-left text-lg font-bold uppercase tracking-wide text-dream-700 sm:text-xl">
				About
			</h2>
			<div className="glass p-8 text-left text-lg tracking-tight text-dream-800 md:p-10">
				<p className="py-4">
					Hello, my name is Laurence. I am a Junior Software Developer who's very
					passionate about creating beautiful seemless experiences for users and
					delivering the best product you can dream. I enjoy thinking about lots of
					possibilities so that the software delivered exceeds expectations.
				</p>
				<p className="py-4">
					My focus is on creating solutions for clients that exceed their
					expectations. I love getting things done and building products that help
					people and communities. Continuous learning is incredibly important to me
					and one of the main reasons I entered into this field. I love building
					projects in my spare time to help me learn new things and to continue
					becoming a better developer.
				</p>
				<p className="py-4">
					When I'm not behind the computer trying to find the best way of doing
					something, you will find me... hiking outdoors, playing soccer with friends,
					snowboarding and immersing myself in movies!
				</p>
			</div>
		</div>
	);
}

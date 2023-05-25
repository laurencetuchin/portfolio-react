import { useEffect, useState } from "react";

export default function Intro() {
	const interests: string[] = [
		"user experience",
		"beautiful software",
		"snowboarding",
	];
	const [currentWord, setCurrentWord] = useState(interests[0]);
	const [currentColorClass, setCurrentColorClass] = useState("");

	// Iterates through word list and time is randomly generated so its less boring.
	useEffect(() => {
		const getRandomTime = () => {
			return Math.floor(Math.random() * 1300) + 200; // Generate a random time between 0.2s and 1.5s in milliseconds
		};

		const interval = setInterval(() => {
			const currentIndex = interests.indexOf(currentWord);
			const nextIndex = (currentIndex + 1) % interests.length;
			setCurrentWord(interests[nextIndex]);
		}, getRandomTime());

		return () => clearInterval(interval);
	}, [currentWord]);

	// Updates colour for each word randomly
	useEffect(() => {
		const colors = [
			"text-red-500",
			"text-blue-500",
			"text-green-500",
			"text-yellow-500",
			"text-purple-500",
		];
		const randomColorClass = colors[Math.floor(Math.random() * colors.length)];
		setCurrentColorClass(randomColorClass);
	}, [currentWord]);

	return (
		<div>
			<h1>My name is Laurence!</h1>
			<h4>I am passionate about</h4>
			<h3 className={currentColorClass}>{currentWord}</h3>
		</div>
	);
}

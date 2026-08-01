import { useEffect, useState } from "react";
import { useReducedMotion } from "../lib/capability";

export const DEFAULT_INTERVAL_MS = 2200;

type Options = {
	intervalMs?: number;
	/** Escape hatch for tests; normally derived from the media query. */
	paused?: boolean;
};

/**
 * Cycles through a list of words on an interval.
 *
 * Replaces the original implementation in Intro.tsx, which had four bugs:
 *
 *   1. The effect depended on the current word, so the interval was torn down
 *      and recreated on every tick.
 *   2. It re-derived its position with `interests.indexOf(currentWord)`, so any
 *      duplicate entry in the list would make the cycle jump.
 *   3. A second effect chased the first to advance the colour, costing an extra
 *      render per tick. The colour is a pure function of the index.
 *   4. The colour started as "" so the first paint was unstyled.
 *
 * It also ran at 500ms, which reads as a strobe rather than a rotation.
 */
export function useRotatingWord<T>(items: readonly T[], options: Options = {}) {
	const { intervalMs = DEFAULT_INTERVAL_MS } = options;
	const reducedMotion = useReducedMotion();
	const paused = options.paused ?? reducedMotion;

	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (paused || items.length <= 1 || intervalMs <= 0) return;

		const id = setInterval(() => {
			// Functional update: the interval never needs re-creating, so it is
			// installed once for the life of the component.
			setIndex((current) => (current + 1) % items.length);
		}, intervalMs);

		return () => clearInterval(id);
	}, [items.length, intervalMs, paused]);

	// Guard against the list shrinking beneath a held index.
	const safeIndex = items.length === 0 ? 0 : index % items.length;

	return {
		index: safeIndex,
		word: items[safeIndex],
		isPaused: paused,
	};
}

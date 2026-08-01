import { useRouteError } from "react-router-dom";

type RouteError = {
	statusText?: string;
	message?: string;
};

export default function Error() {
	// useRouteError returns `unknown`. The original annotated it `any`, which
	// tripped no-explicit-any and — because lint runs with --max-warnings 0 —
	// made the whole lint script fail.
	const error = useRouteError() as RouteError | null;

	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occured</p>
			<p>
				<i>{error?.statusText ?? error?.message ?? "Unknown error"}</i>
			</p>
		</div>
	);
}

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
// index.css owns the @tailwind directives. Do not import "tailwindcss/tailwind.css"
// anywhere as well — that duplicates the entire framework in the output CSS.
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

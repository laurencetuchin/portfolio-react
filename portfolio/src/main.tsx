import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "tailwindcss/tailwind.css";
import App from "./App.tsx";
import Error from "./Error.tsx";
import "./index.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: <div></div>,
		errorElement: <Error />,
	},
	{
		path: "/projects",
		element: <div>Projects</div>,
		errorElement: <Error />,
	},
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
		<App />
	</React.StrictMode>
);

import { createRoot } from "react-dom/client";
import React from "react";
const container = document.getElementById("root");
const root = createRoot(container);
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@context/auth";
import { SiteContext } from "@context/site";
import { UtilsContext } from "@context/utils";

import 'bootstrap/dist/css/bootstrap.css';
import "./css/index";

// // home page
import HomePage from "./pages/HomePage";
import ScrollToTop from "@components/ScrollToTop";

// clear console log on hot reload
if (import.meta.hot) {
	import.meta.hot.on(
	  	"vite:beforeUpdate",
	  	/* eslint-disable-next-line no-console */
	  	() => console.clear()
	);
}



root.render(
	<AuthProvider>
		<React.StrictMode>
			<SiteContext>
				<UtilsContext>
					<BrowserRouter> 
						<ScrollToTop />
						<HomePage /> 
					</BrowserRouter>
				</UtilsContext>
			</SiteContext>
		</React.StrictMode>
	</AuthProvider>
);
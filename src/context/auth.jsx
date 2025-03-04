import React, { useState, useEffect, useContext, createContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const authContext = createContext();
export function AuthProvider({ children }) {
	const auth = useAuthProvider();
	return <authContext.Provider value={auth}> { children } </authContext.Provider>
}

export const useAuth = () => useContext(authContext);

// set cookie
const setCookie = (name, value, days) => {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + value + expires + "; path=/";
}

// get cookie
const getCookie = (name) => {
	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
	  	const cookie = cookies[i].trim();
	  	if (cookie.startsWith(name + '=')) return cookie.substring(name.length + 1);
	}
	return null;
}

function useAuthProvider() {
	const [user, setUser] = useState(null);

	// sign in
	const signin = async (credentials, callback) => {
		let jsonData = credentials;
		jsonData.action = "login";
		
		const response = await axios.post("/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler",JSON.stringify(jsonData), {
			headers: { "Content-Type": "application/json" },
			withCredentials: true
		});
		let result = (response.data?.data) ? JSON.parse(response.data?.data) : response.data;
		// manually set fe cookie
		if (!result.error) setCookie("xpr-token-frontend", result.token, 5);

		// get xsrf token from cookie
		let sessionCookie = (getCookie("xpr-token-frontend")) ? document.cookie.replace(/(?:(?:^|.*;\s*)xpr-token-frontend\s*\=\s*([^;]*).*$)|^.*$/, "$1") : "";
		let sessionData = sessionCookie ? JSON.parse(atob(sessionCookie.split('.')[1])) : "";
		let xsrf_token = sessionData.xsrf;

		let userData = {"token": result.token, "xsrf_token": xsrf_token, "data": response.data?.user};
		if (!result.error) {
			setUser(userData);
			localStorage.removeItem("invalid_token");
			localStorage.setItem("user",JSON.stringify(userData));
		}
		if (callback) callback(result);
	}

	// sign up
	const signup = async (credentials, callback) => {
		let jsonData = credentials;
		const response = await axios.post("/__xpr__/pub_engine/admin-react-rebuild/element/registration",JSON.stringify(jsonData), {
			headers: { "Content-Type": "application/json" },
			withCredentials: true
		});
		let result = (response.data?.data) ? JSON.parse(response.data?.data) : response.data; 
		if (callback) callback(result);
	}

	// sign out
	const signout = async (callback) => {
		let user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
		let jsonData = { action: "logout" };
		const response = await axios.post("/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler",JSON.stringify(jsonData), {
			headers: {
				"Auth": user.token,
				"Content-Type": "application/json" 
			},
			withCredentials: true
		});

		// clear user data
		setUser(null);
		localStorage.removeItem("user");
		if (callback) callback(response);
	}

	// password reset
	const password_reset = async (credentials, callback) => {
		let jsonData = credentials;
		const response = await axios.post("/__xpr__/pub_engine/admin-react-rebuild/element/forgot_password",JSON.stringify(jsonData), {
			headers: { "Content-Type": "application/json" },
			withCredentials: true
		});
		let result = (response.data?.data) ? JSON.parse(response.data?.data) : response.data; 
		if (callback) callback(result);
	}

	// check authentication
	useEffect(() => {
		// validate access token on page load
		let user_data = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
		if (user_data && !localStorage.getItem("invalid_token")) {
			let token = user_data.token;
			let jsonData = { action: "checkAuth" };
			axios.post("/__xpr__/pub_engine/admin-react-rebuild/element/ajax_handler",JSON.stringify(jsonData), {
				headers: {
					"Auth": token,
					"Content-Type": "application/json" 
				},
				withCredentials: true
			})
			.then(function(response) {
				// invalid/expired token
				if (response.data?.error) {
					// clear user data and redirect user to lock screen
					localStorage.removeItem("user");
					let token_data = { error: response.data?.error, user_info: user_data.data, from: (location.pathname + location.search) };			
					localStorage.setItem("invalid_token", JSON.stringify(token_data));
					// let { language } = useParams("language");
					window.location.replace( "/dashboard/sign-in");
				}
			});
		}
	}, [])

	return {
		user,
		signin,
		signup,
		signout,
		password_reset
	}
}
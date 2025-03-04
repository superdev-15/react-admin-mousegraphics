import { useState, useEffect } from "react";
import { useLocation, Navigate, Outlet, Routes, Route } from "react-router-dom";

import { AllRoutes } from "../routes";
import { useSite } from "@context/site";
import { useAuth } from "@context/auth";

import Login from "./Login";
import NotFoundPage from "./NotFound";
import ServerError from "./ServerError";

import Preloader from "@components/Preloader";
import Navbar from "@components/Navbar";
import Dashboard from "./Dashboard";
import AddEditArticle from "./AddEditArticle";

export const RouteWithLoader = ({ compoent: Component, ...rest }) => {
  let site = useSite();
  const [loaded, setLoaded] = useState(site.siteConfig.showPreloader);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(!site.siteConfig.showPreloader), 1000);
    return () => clearTimeout(timer);
  }, [site]);

  return (
    <div className="h-100 home">
      <Preloader show={loaded ? false : true} />
      <Component {...rest} />
    </div>
  )
};

const RouteWithNavbar = ({ component: Component, ...rest }) => {
  return (
    <div style={{overflowX: 'hidden'}}>
      <Navbar />
      {/* <main className="content mx-5"> */}
        <Component/>
      {/* </main> */}
    </div>
  )
};

function PrivateRoute({ component: Component, ...rest }) {
  
  let auth = useAuth();
  const location = useLocation();
  let userData = (localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : ""; 
	auth.user = userData;
	// redirect to lock screen if token is expired/invalid
	let redirect_url = "/dashboard/sign-in";
	return (
    auth.user ? <Outlet {...rest} location={location}/> :
    (<Navigate to={redirect_url} state={{ from: location }} replace />)
	)
}

export default () => (
  <Routes>
    <Route path={AllRoutes.Login.path} element={<RouteWithLoader compoent={Login} />} />
    <Route path={AllRoutes.NotFound.path} element={<RouteWithLoader compoent={NotFoundPage} />} />
    <Route path={AllRoutes.ServerError.path} element={<RouteWithLoader component={ServerError} dashboard={false}/>}/>
    {/* pages */}
    <Route element={<PrivateRoute />}>
      {/* set landing page redirect */}
      <Route index element={<Navigate to={AllRoutes.Dashboard.path} replace/>}/>
      <Route path={AllRoutes.Home.path} element={<Navigate to={AllRoutes.Dashboard.path} replace/>}/>

			{/* components list */}
			<Route path={AllRoutes.Dashboard.path} element={<RouteWithNavbar component={Dashboard}/>}/>
      <Route path={AllRoutes.Add.path} element={<RouteWithNavbar component={AddEditArticle}/>}/>
      <Route path={AllRoutes.Edit.path} element={<RouteWithNavbar component={AddEditArticle}/>}/>
		</Route>

    <Route path='*' element={<NotFoundPage />} />
  </Routes>
)
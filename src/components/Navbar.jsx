import React from "react";
import { useSite } from "@context/site";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/auth";

export default (props) => {
  let site = useSite(); 
  let auth = useAuth();
  
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signout(res => {
      site.useUpdateSiteConfig("showPreloader", false);
			navigate("/");
    });
  }

  return (
    <div id="header" className="row header border-bottom-979797 mb-4">
      <div className="container-fluid px-5 py-3">
        <div className="d-flex flex-row align-items-center justify-content-between">
          <a href="/dashboard" className="inline-block">
            <img src="/media/mg_logo.svg" alt="logo" />
          </a>
          <div className="inline-block">
            <a className="big-arrow icon-sign-in mr-lg-30 mr-sm-20 mr-xs-0" onClick={(e) => {handleLogout(e)}}>log out
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
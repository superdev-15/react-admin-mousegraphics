import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/auth";
import { useSite } from "@context/site";
import { useFormik } from "formik";
import * as Yup from "yup";

function Login(props) {
  let auth = useAuth();
  let site = useSite();
  let navigate = useNavigate();

  let from = "/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  let credentials = {
    UserLogin: username,
    UserPassword: password
  };

  const form = useFormik({
    initialValues: {
      username: "",
      password: ""
    },
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: Yup.object({
      username: Yup.string().required("Email is required"),
      password: Yup.string().required("Password is required")
    }),
    onSubmit: (values) => {
      handleSubmit();
    }
  });

  const handleSubmit = () => {
    auth.signin(credentials, (res) => {
      if (res.status === "SUCCESS") {
        navigate(from, { replace: true });
      } else if (res.error) {
        if (res.error == 400) {
          setError("")
        }
        if (res.error == 403) {
          setError("Incorrect email and password");
        }
        if (res.error == 429) setError("Too many requests. Try again later.");
        if (!res?.error) setError("No server response"); 
      }
    })
  };

  // redirect user if they are logged in
  useEffect(() => {
    if (localStorage.getItem("user")) navigate(from, { replace: true });
  }, []);

  return (
    <div className="page">
      <div className="middle-table">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-sm-6 col-xs-12">
              <div className="row justify-content-center">
                <div id="login-box-wrapper" className="login-box-wrapper d-flex flex-column align-items-start">
                  <div className="row mb-sm-20 mb-xs-10">
                    <img src="/media/mg_logo.svg" alt="logo" />
                  </div>
                  <div className="row">
                    <p className="medium mb-sm-35 mb-xs-20">projects log in</p>
                  </div>
                  <div className="col-md-12 mb-25 mb-md-20">
                    <form onSubmit={form.handleSubmit} id="F0584611001476434930" encType="multipart/form-data" method="POST" className="col-xs-12">
                      <div className="form-group d-flex flex-column align-items-start">
                        <label htmlFor="UserLogin">username</label>
                        <input type="email" id="UserLogin" name="UserLogin" onChange={e => { setUsername(e.target.value);form.setFieldValue(`username`, e.target.value);}} placeholder="example@example.com" required className={error ? "has-error form-control-input" : "form-control-input"} title="Please enter your email address"/>
                        <span className="help-block"></span>
                      </div>
                      
                      <div className="form-group mb-25 mb-md-10 d-flex flex-column align-items-start">
                        <label htmlFor="UserPassword">password</label>
                        <input type="password" id="UserPassword" name="UserPassword" onChange={e => {setPassword(e.target.value);form.setFieldValue(`password`, e.target.value);}} placeholder="Password" required className={error ? "has-error form-control-input" : "form-control-input"} title="Please enter your password"/>
                        {error &&
                        <div id="loginErrorMsg" className="alert alert-error">Incorrect email and password</div>}
                      </div>
                      <button type="submit" className="btn btn-block btn-common big-arrow icon-sign-in mt-sm-15 mt-xs-5 ps-1">sign in</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

import React from "react";
// import { Col, Row, Card, Image, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Image404 from "@assets/img/illustrations/404.svg";


function NotFound(props) {
	return (
		<main>
			<section className="vh-100 d-flex align-items-center justify-content-center">
				<div className="container">
					<div className="row">
						<div xs={12} className="col-xs-12 text-center d-flex align-items-center justify-content-center">
						<div>
							<div href="/">
								<img src={Image404} className="img-fluid w-75" />
							</div>
							<h1 className="text-primary mt-5">
							Page not <span className="fw-bolder">found</span>
							</h1>
							<p className="lead my-4">
								Oops! Looks like you followed a bad link. If you think this is a
								problem with us, please tell us.
							</p>
							<a variant="primary" className="animate-hover" href="/">
								Go back
							</a>
						</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

export default NotFound;

import React from "react";
// import { Col, Row, Image, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Image500 from "@assets/img/illustrations/500.svg";


function ServerError(props) {
	return (
		<main>
			<section className="vh-100 d-flex align-items-center justify-content-center">
				<div className="container">
					<div className="row align-items-center">
						<div xs={12} lg={5} className="col-xs-12 order-2 order-lg-1 text-center text-lg-left">
							<h1 className="text-primary mt-5">
								Something has gone <span className="fw-bolder">seriously</span> wrong
							</h1>
							<p className="lead my-4">
								It's always time for a coffee break. We should be back by the time you finish your coffee.
							</p>
							<button as={Link} variant="primary" className="animate-hover" to="/">
								Go back
							</button>
						</div>
						<div xs={12} lg={7} className="col-xs-12 order-1 order-lg-2 text-center d-flex align-items-center justify-content-center">
							<img src={Image500} className="img-fluid w-75" />
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
export default ServerError;
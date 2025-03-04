import React, { useEffect, useState } from "react";
import { useSite } from "@context/site";

export default (props) => {
	const { show } = props;
	const site = useSite();
	
  return (
    <div className={`preloader spinner-wrapper ${show ?  "show" : "hide"}`}>
      <div className="center-gif">
        &nbsp;
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from "react";

/**
 *
 * @param {*} props
 * @returns
 */
const Layout = (props) => {
  return (
    <div className="container" style={{ backgroundColor: "#FAFAFD" }}>
      <h1>JPYC Arbitrage Bot</h1>
      <small>polygon hackhason!!</small>
      {props.children}
    </div>
  );
};

export default Layout;

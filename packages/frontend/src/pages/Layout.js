import React, { useEffect, useRef } from "react";

/**
 *
 * @param {*} props
 * @returns
 */
const Layout = (props) => {
  return (
    <div className={props.className}>
      <h1 className="font-bold">JPYC Arbitrage Bot</h1>
      <small>polygon hackhason!!</small>
      <div className={props.contentClassName}> {props.children}</div>
    </div>
  );
};

export default Layout;

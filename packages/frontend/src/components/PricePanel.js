import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

/**
 *
 * @param {*} props
 * @returns
 */
const PricePanel = ({ id = "myChart", className = "", label = "xyz swap" }) => {
  return (
    <div className="panel">
      <p> {label}</p>
      <p> {"price"}</p>
    </div>
  );
};

export default PricePanel;

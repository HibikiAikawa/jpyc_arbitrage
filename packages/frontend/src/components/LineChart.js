import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

/**
 *
 * @param {*} props
 * @returns
 */
const LineChart = ({ id = "myChart", className = "", data = {} }) => {
  const chartRef = useRef();
  //
  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    var myChart = new Chart(ctx, {
      type: "line",
      data: data,
    });

    return () => {
      myChart.destroy();
    };
  }, [id, className, data]);

  return (
    <canvas
      id={id}
      className={className}
      style={{ width: "100%", height: "100%" }}
      ref={chartRef}
    />
  );
};

export default LineChart;

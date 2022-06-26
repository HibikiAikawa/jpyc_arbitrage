import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

/**
 *
 * @param {*} props
 * @returns
 */
const LineChart = ({ className = "", label = "損益グラフ", data = {} }) => {
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
  }, [className, data]);

  return (
    <div className={`p-2 ${className}`}>
      <p className="text-xl">{label}</p>
      <canvas ref={chartRef} />
    </div>
  );
};

export default LineChart;

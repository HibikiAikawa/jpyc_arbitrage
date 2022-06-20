import React, { useState, useEffect } from "react";
import axios from "axios";

function getRandomArbitrary(min = 0, max = 10) {
  return Math.random() * (max - min) + min;
}
function getRandomData() {
  let r = getRandomArbitrary;
  let data = {
    labels: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    datasets: [
      {
        data: [r(), r(), r(), r(), r(), r(), r()],
        label: "dex1 jpyc-usdc",
        borderColor: "#542535",
        backgroundColor: "#542535",
        fill: false,
      },
      {
        data: [r(), r(), r(), r(), r(), r(), r()],
        label: "dex2 jpyc-usdc",
        borderColor: "#3e95cd",
        backgroundColor: "#7bb6dd",
        fill: false,
      },
    ],
  };
  return data;
}

const useHistory = () => {
  //
  const [data, setData] = useState();

  //
  useEffect(() => {
    // ランダムデータを取得
    let data = getRandomData();
    setData(data);
    const id = setInterval(() => {
      let data = getRandomData();
      setData(data);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return [data];
};

export default useHistory;

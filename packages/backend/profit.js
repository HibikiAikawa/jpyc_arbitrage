const fs = require("fs");
const { stringify } = require("csv-stringify/sync");
const { parse } = require("csv-parse/sync");

const testdata = [
    { date: 1655943137, amount: 10, profit: 0.1 },
    { date: 1656948329, amount: 10.03, profit: 0.13 },
    { date: 1657128378, amount: 9.91, profit: 0.01 },
    { date: 1657128379, amount: 9.9, profit: 0 },
    { date: 1657128380, amount: 9.9, profit: 0 },
    { date: 1657128381, amount: 9.9, profit: 0 },
    { date: 1657128382, amount: 9.9, profit: 0 }
  ];
  
  let csvString = stringify(testdata, {
    header: true,
  });

  exports.init = () => {
    fs.writeFileSync("profit.csv", csvString);
  }

  exports.all = () => {
    const data = fs.readFileSync("profit.csv");
    const records = parse(data, {
      columns: true,
    });
    return records;
  };

  exports.add = () => {
    testdata.push({ date: Math.floor(Date.now() / 1000 ), amount: 9.9, profit: 0 }); //
    csvString = stringify(testdata, {
      header: true,
    });
    fs.writeFileSync("profit.csv", csvString);
  };

  exports.profit = () => {
    const data = fs.readFileSync("profit.csv");
    const records = parse(data, {
      columns: true,
    });
    const len = records.length;
  
    const week = [];
    for (let i=7; i>0; i--) {
      week.push(records[len - i].profit)
    }
  
    return {
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
          data: week,
          label: "dex1 jpyc-usdc",
          borderColor: "#542535",
          backgroundColor: "#542535",
          fill: false,
        },
      ],
    };
  };
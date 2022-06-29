const fs = require("fs");
const { stringify } = require("csv-stringify/sync");
const { parse } = require("csv-parse/sync");

exports.all = () => {
  try { // profit.csvがあれば読み込む
    const data = fs.readFileSync("profit.csv");
    const records = parse(data, {
      columns: true,
    });
    return records;
  } catch (e) { // なければ空のprofit.csvを作成する
    fs.writeFileSync(
      "profit.csv",
      stringify([], {
        header: true,
      })
    );
    return [];
  }
};

// main.jsで使うときはcache = profitCacheを代入する
exports.add = (cache, amount, profit, date = Math.floor(Date.now() / 1000)) => {
  cache.push({ date, amount, profit }); //
  const csvString = stringify(cache, {
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
  for (let i = 7; i > 0; i--) {
    week.push(records[len - i].profit);
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

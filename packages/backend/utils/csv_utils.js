const fs = require("fs");
const { stringify } = require("csv-stringify/sync");
const { parse } = require("csv-parse/sync");

const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));

// 直近で裁定機会が発生していたかをチェックするための変数
// 直近で裁定機会が発生していた場合はcsvに書き込まないようにする
const profitCheck = JSON.parse(
  fs.readFileSync(`./config/${config.file.path}`, "utf8")
);
Object.keys(profitCheck).forEach((dexPair) => {
  Object.keys(profitCheck[dexPair]).forEach((tokenPair) => {
    profitCheck[dexPair][tokenPair] = { forward: false, backward: false };
  });
});

/**
 * csvNameのcsvファイルがあるならそれを読み込み.無ければ新規作成
 * @param {string} csvName - csvのファイル名
 * @returns {list} - 現在のcsvファイル内のデータのリスト
 */
const readCsv = (csvName) => {
  try {
    // profit.csvがあれば読み込む
    const data = fs.readFileSync(csvName);
    const records = parse(data, {
      columns: true,
    });
    return records;
  } catch (e) {
    // なければ空のprofit.csvを作成する
    fs.writeFileSync(
      csvName,
      stringify([], {
        header: true,
      })
    );
    return [];
  }
};

/**
 * 新しい取引データをcsvファイルに追加する
 * @param {string} csvName - csvファイル名
 * @param {list} cache - 現在のcsvデータ
 * @param {string} dexPair - アービトラージしたDEXペア
 * @param {string} tokenPair - アービトラージしたTokenペア
 * @param {float} amount - 取引トークン量
 * @param {float} profit - 推定収益
 * @param {int} date - 裁定機会が起きた時間
 */
const writeRow = (
  csvName,
  cache,
  dexPair,
  tokenPair,
  amount,
  profit,
  direction,
  startToken,
  date = Math.floor(Date.now() / 1000)
) => {
  cache.push({
    date,
    dexPair,
    tokenPair,
    amount,
    profit,
    direction,
    startToken,
  }); //
  const csvString = stringify(cache, {
    header: true,
  });
  fs.writeFileSync(csvName, csvString);
};

/**
 * estimationDataに含まれるデータの中からプラス収益になるアービトラージ取引だけをcsvファイルに追加する
 * @param {string} csvName - csvファイル名
 * @param {list} csvData - csvファイルに格納されているデータ
 * @param {list} estimationData - アービトラージの推定収益
 */
const writeOutProfit = (csvName, csvData, estimationData) => {
  for (let i = 0; i < estimationData.length; i += 1) {
    const {
      dexPairKey,
      tokenPairKey,
      amountIn,
      profit,
      direction,
      startToken,
    } = estimationData[i];
    // 裁定機会がある場合
    if (parseFloat(profit) > 0) {
      // 直近で裁定機会がない
      if (!profitCheck[dexPairKey][tokenPairKey][direction]) {
        try {
          writeRow(
            csvName,
            csvData,
            dexPairKey,
            tokenPairKey,
            amountIn,
            profit,
            direction,
            startToken
          );
        } catch (e) {
          console.log("error: writeRow.");
        }
        profitCheck[dexPairKey][tokenPairKey][direction] = true;
      }
    } else {
      // 裁定機会がない場合
      profitCheck[dexPairKey][tokenPairKey][direction] = false;
    }
  }
};
/*
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

exports.result = (n) => {
  const data = fs.readFileSync("profit.csv"); // todo:別のCSV
  const records = parse(data, {
    columns: true,
  });

  return records.slice(-n).reverse();
};

*/

exports.readCsv = readCsv;
exports.writeRow = writeRow;
exports.writeOutProfit = writeOutProfit;

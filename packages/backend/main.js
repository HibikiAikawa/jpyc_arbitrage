require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");
// const express = require("express");

const print = require("./utils/printer");
const utils = require("./utils/utils");
const csvFunc = require("./utils/csv_utils");
const eventFunc = require("./eventHandler");
const calcFunc = require("./calculate");
// const arbFunc = require("./arbHandler");

const address = JSON.parse(fs.readFileSync("./config/address.json", "utf8"));
const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));

// 各プールのトークン保有量を記録するJSON
const tokenReserves = utils.createTokenJson(address);
// アービトラージの取引利益の推定用
const csvData = csvFunc.readCsv(config.csvProp.csvName)


/**
 * ブロックチェーンに記録されているグローバルなトークン量を問い合わせた時に使うイベント関数
 * 初回実行時・起動後定期的に問い合わせる
 * @param {object} variable - プールからのイベント情報とチェーン・DEX・トークンペア名などの付加情報
 */
const onUpdate = (variable) => {
  const { chain, dex, pair, event, token0Reserves, token1Reserves } = variable;
  const tokens = utils.sortTokens(address, chain, pair);

  // console.log(`(${event})`);
  tokenReserves[chain][dex][pair][tokens[0]] = token0Reserves;
  tokenReserves[chain][dex][pair][tokens[1]] = token1Reserves;
};

/**
 * イベント用関数(swap)
 * プールからtoken0が減る(増える)&token1が増える(減る)
 * @param {object} variable - プールからのイベント情報とチェーン・DEX・トークンペア名などの付加情報
 */
const onSwap = (variable) => {
  const { chain, dex, pair, event, args } = variable;
  const { senderAddress, amount0In, amount1In, amount0Out, amount1Out, to } =
    args;
  const tokens = utils.sortTokens(address, chain, pair);
  // console.log("\033[10F\033[0J");
  console.log(`(${event}) --- ${dex} - ${pair}`);
  // トークンの流れ
  // token0:コントラクト -> ユーザー    token1:ユーザー -> コントラクト
  if (amount0In.isZero()) {
    console.log("amount0Out:", amount0Out.toString());
    console.log("amount1In:", amount1In.toString());
    tokenReserves[chain][dex][pair][tokens[0]] =
      tokenReserves[chain][dex][pair][tokens[0]].sub(amount0Out);
    tokenReserves[chain][dex][pair][tokens[1]] =
      tokenReserves[chain][dex][pair][tokens[1]].add(amount1In);
  }

  // トークンの流れ
  // token0:ユーザー -> コントラクト token1:コントラクト -> ユーザー
  if (amount0Out.isZero()) {
    console.log("amount0In:", amount0In.toString());
    console.log("amount1Out:", amount1Out.toString());
    tokenReserves[chain][dex][pair][tokens[0]] =
      tokenReserves[chain][dex][pair][tokens[0]].add(amount0In);
    tokenReserves[chain][dex][pair][tokens[1]] =
      tokenReserves[chain][dex][pair][tokens[1]].sub(amount1Out);
  }

  // Swapによって裁定機会が生まれたかチェック
  const estimationData = calcFunc.estimateProfit(tokenReserves);
  csvFunc.writeOutProfit(config.csvProp.csvName, csvData, estimationData)
    // print.printTokenReserves(tokenReserves);
};

const onMint = (variable) => {
  const { chain, dex, pair, event, args } = variable;
  const tokens = utils.sortTokens(address, chain, pair);
  const { senderAddress, amount0, amount1, to } = args;
  console.log("\033[10F\033[0J");
  console.log(`(${event}) --- ${dex} - ${pair}`);
  tokenReserves[chain][dex][pair][tokens[0]] =
    tokenReserves[chain][dex][pair][tokens[0]].add(amount0);
  tokenReserves[chain][dex][pair][tokens[1]] =
    tokenReserves[chain][dex][pair][tokens[1]].add(amount1);
};

const onBurn = (variable) => {
  const { chain, dex, pair, event, args } = variable;
  const tokens = utils.sortTokens(address, chain, pair);
  const { senderAddress, amount0, amount1, to } = args;
  console.log("\033[10F\033[0J");
  console.log(`(${event}) --- ${dex} - ${pair}`);
  tokenReserves[chain][dex][pair][tokens[0]] =
    tokenReserves[chain][dex][pair][tokens[0]].sub(amount0);
  tokenReserves[chain][dex][pair][tokens[1]] =
    tokenReserves[chain][dex][pair][tokens[1]].sub(amount1);
};

const main = async () => {
  await eventFunc.startPoolTrack(address);
  eventFunc.dexEvent.on("Update", onUpdate);
  eventFunc.dexEvent.on("Swap", onSwap);
  eventFunc.dexEvent.on("Mint", onMint);
  eventFunc.dexEvent.on("Burn", onBurn);

  setInterval(async () => {
    // console.log("\033[10F\033[0J");
    console.log("(update)");
    // print.printTokenReserves(tokenReserves);
  }, 60000); // 5分
};

main();

/*
// REST API
const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTION"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const server = app.listen(3002, () => {
  console.log("Node.js is listening to PORT:", server.address().port);
});

app.get("/rate", (req, res) => {
  res.send({
    status: true,
    body: calFunc.rate(
      quickJpycReserves,
      quickUsdcReserves,
      sushiJpycReserves,
      sushiUsdcReserves
    ),
  });
});

app.get("/profit", (req, res) => {
  res.send(profitFunc.profit());
});

app.get("/result/:n", (req, res) => {
  res.send(profitFunc.result(req.params.n));
});

app.get("/add/testdata", (req, res) => {
  res.send(add7Times());
});
*/

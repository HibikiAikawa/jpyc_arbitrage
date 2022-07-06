require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");
const express = require("express");
const pairContractAbi =
  require("@uniswap/v2-core/build/IUniswapV2Pair.json").abi;
const profitFunc = require("./profit");
const eventFunc = require("./eventHandler");
const calFunc = require("./calculate");
const arbFunc = require("./arbHandler");
const printFunc = require("./utils/printer");

const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

// TODO infraAPIの取得
const provider = ethers.getDefaultProvider("matic");
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);

// USDC/JPYCプールコントラクト(Quickswap)
const QuickContract = new ethers.Contract(
  address.POOL.QUICKSWAP,
  pairContractAbi,
  signer
);

// USDC/JPYCプールコントラクト(Sushiswap)
const SushiContract = new ethers.Contract(
  address.POOL.SUSHISWAP,
  pairContractAbi,
  signer
);

// poolのトークン量の変数
let quickJpycReserves;
let quickUsdcReserves;
let sushiJpycReserves;
let sushiUsdcReserves;

// アビトラ前のコントラクトのトークン量
let beforeUsdc;
let beforeJpyc;
// profit.csvの内容と同期させる
let profitCache = [];
profitCache = profitFunc.all();

// 現在アービトラージをやっているかを判断する変数
// 取引中に新しいイベントをリッスンしてアービトラージ機会が発生すると二重にトレードをしてしまいエラーが起こる
let nowArb = false;

// rateの増減を判定するためのキャッシュ
let globalRates;

const amountCheck = (amount0In, amount1In, amount0Out, amount1Out) => {
  if (amount0In.isZero()) console.log("usdc(out):", amount0Out.toString());
  if (amount0Out.isZero()) console.log("usdc(in) :", amount0In.toString());
  if (amount1In.isZero()) console.log("jpyc(out):", amount1Out.toString());
  if (amount1Out.isZero()) console.log("jpyc(in) :", amount1In.toString());
};

// 裁定機会のチェック
const getPriceDiff = () =>
  calFunc.rateDiff(
    quickJpycReserves,
    quickUsdcReserves,
    sushiJpycReserves,
    sushiUsdcReserves,
    config.tradeQuantity
  );

const arbitrage = async (diff) => {
  if (diff > 0 && !nowArb) {
    nowArb = true;
    let bool;
    try {
      await arbFunc.dualDexTrade(
        address.ROUTER.QUICKSWAP,
        address.ROUTER.SUSHISWAP,
        address.TOKEN.USDC.Address,
        address.TOKEN.JPYC.Address,
        ethers.BigNumber.from(
          (config.tradeQuantity * 10 ** address.TOKEN.USDC.Decimals).toString()
        ).toHexString()
      );
      bool = true;
    } catch (error) {
      bool = false;
    }
    if (bool) {
      // TODO 実行結果をcsvに追加する処理を入れる
      console.log("swap is successed");
    } else {
      console.log("swap is failed");
    }
    nowArb = false;
  }
};

const onSwapQuick = async (
  senderAddress,
  amount0In,
  amount1In,
  amount0Out,
  amount1Out,
  to
) => {
  console.log("(event QuickSwap)");
  console.log("from:", senderAddress, "to:", to);
  amountCheck(amount0In, amount1In, amount0Out, amount1Out);
  quickUsdcReserves = quickUsdcReserves.add(amount0In).sub(amount0Out);
  quickJpycReserves = quickJpycReserves.add(amount1In).sub(amount1Out);
  const rates = calFunc.rate(
    quickJpycReserves,
    quickUsdcReserves,
    sushiJpycReserves,
    sushiUsdcReserves
  );
  printFunc.Rates(globalRates.QUICKSWAP.buy, rates.QUICKSWAP.buy, "QuickSwap");
  printFunc.Rates(globalRates.SUSHISWAP.buy, rates.SUSHISWAP.buy, "SushiSwap");
  globalRates = rates;
  // 裁定機会のチェック
  const priceDiff = getPriceDiff();

  // 裁定機会があるならアービトラージ
  arbitrage(priceDiff["QUICK/SUSHI"]);
  console.log("estimated profits | QUICK->SUSHI:", priceDiff["QUICK/SUSHI"]);
  console.log("estimated profits | SUSHI->QUICK:", priceDiff["SUSHI/QUICK"]);
  console.log(
    "----------------------------------------------------------------"
  );
};

const onSwapSushi = async (
  senderAddress,
  amount0In,
  amount1In,
  amount0Out,
  amount1Out,
  to
) => {
  console.log("(event SushiSwap)");
  console.log("from:", senderAddress, "to:", to);
  amountCheck(amount0In, amount1In, amount0Out, amount1Out);
  sushiUsdcReserves = sushiUsdcReserves.add(amount0In).sub(amount0Out);
  sushiJpycReserves = sushiJpycReserves.add(amount1In).sub(amount1Out);
  const rates = calFunc.rate(
    quickJpycReserves,
    quickUsdcReserves,
    sushiJpycReserves,
    sushiUsdcReserves
  );

  printFunc.Rates(globalRates.QUICKSWAP.buy, rates.QUICKSWAP.buy, "QuickSwap");
  printFunc.Rates(globalRates.SUSHISWAP.buy, rates.SUSHISWAP.buy, "SushiSwap");
  // 裁定機会のチェック
  const priceDiff = getPriceDiff();
  console.log("estimated profits | QUICK->SUSHI:", priceDiff["QUICK/SUSHI"]);
  console.log("estimated profits | SUSHI->QUICK:", priceDiff["SUSHI/QUICK"]);

  // 裁定機会があるならアービトラージ
  arbitrage(priceDiff["SUSHI/QUICK"]);
  console.log(
    "----------------------------------------------------------------"
  );
};

const updateReserves = async () => {
  // プールのステーク量を取得
  const quickReserves = await QuickContract.getReserves();
  const sushiReserves = await SushiContract.getReserves();
  [quickUsdcReserves, quickJpycReserves] = quickReserves;
  [sushiUsdcReserves, sushiJpycReserves] = sushiReserves;
  let rates = calFunc.rate(
    quickJpycReserves,
    quickUsdcReserves,
    sushiJpycReserves,
    sushiUsdcReserves
  );
  globalRates = rates;
  console.log("(first)");
  console.log("buy rate          | QuickSwap:", rates.QUICKSWAP.buy);
  console.log("buy rate          | SushiSwap:", rates.SUSHISWAP.buy);

  const priceDiff = getPriceDiff();

  // DEX間の価格差の取得
  console.log("estimated profits | QUICK->SUSHI:", priceDiff["QUICK/SUSHI"]);
  console.log("estimated profits | SUSHI->QUICK:", priceDiff["SUSHI/QUICK"]);
  // コントラクトの保有しているトークン量
  beforeUsdc = await calFunc.getBalance(
    address.TOKEN.USDC.Decimals,
    address.TOKEN.USDC.Address
  );
  beforeJpyc = await calFunc.getBalance(
    address.TOKEN.JPYC.Decimals,
    address.TOKEN.JPYC.Address
  );
  console.log("USDC Balance:", beforeUsdc);
  console.log("JPYC Balance:", beforeJpyc);
  console.log(
    "----------------------------------------------------------------"
  );

  QuickContract.on("Swap", onSwapQuick);
  SushiContract.on("Swap", onSwapSushi);

  setInterval(async () => {
    const quickLatestReserves = await QuickContract.getReserves();
    const sushiLatestReserves = await SushiContract.getReserves();
    [quickUsdcReserves, quickJpycReserves] = quickLatestReserves;
    [sushiUsdcReserves, sushiJpycReserves] = sushiLatestReserves;
    rates = calFunc.rate(
      quickJpycReserves,
      quickUsdcReserves,
      sushiJpycReserves,
      sushiUsdcReserves
    );
    console.log("(latest)");
    printFunc.Rates(
      globalRates.QUICKSWAP.buy,
      rates.QUICKSWAP.buy,
      "QuickSwap"
    );
    printFunc.Rates(
      globalRates.SUSHISWAP.buy,
      rates.SUSHISWAP.buy,
      "SushiSwap"
    );
    console.log(
      "----------------------------------------------------------------"
    );
    globalRates = rates;
  }, 60000); // 5分
};
// updateReserves();


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

// デバッグ用API:以下は本番までに消します
const add7Times = () => {
  profitFunc.writeRow(profitCache, 10, 0);
  profitFunc.writeRow(profitCache, 10.2, 0.2);
  profitFunc.writeRow(profitCache, 10.3, 0.3);
  profitFunc.writeRow(profitCache, 10.3, 0.3);
  profitFunc.writeRow(profitCache, 10, 0);
  profitFunc.writeRow(profitCache, 9.8, -0.2);
  profitFunc.writeRow(profitCache, 9.9, -0.1);
};

app.get("/add/testdata", (req, res) => {
  res.send(add7Times());
});

require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");
const express = require("express");
const pairContractAbi =
  require("@uniswap/v2-core/build/IUniswapV2Pair.json").abi;
const profitFunc = require("./profit");
// const eventFunc = require("./eventHandler");
const calFunc = require("./calculate");
const arbFunc = require("./arbHandler");

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

// profit.csvの内容と同期させる
let profitCache = [];
profitCache = profitFunc.all();

// 現在アービトラージをやっているかを判断する変数
// 取引中に新しいイベントをリッスンしてアービトラージ機会が発生すると二重にトレードをしてしまいエラーが起こる
let nowArb = false;

const onSwapQuick = async (
  senderAddress,
  amount0In,
  amount1In,
  amount0Out,
  amount1Out,
  to
) => {
  console.log("(Quick) from:", senderAddress, "to:", to);
  if (amount0In.isZero()) console.log("usdc(out):", amount0Out.toString());
  if (amount0Out.isZero()) console.log("usdc(in): ", amount0In.toString());
  if (amount1In.isZero()) console.log("jpyc(out):", amount1Out.toString());
  if (amount1Out.isZero()) console.log("jpyc(in): ", amount1In.toString());
  quickUsdcReserves = quickUsdcReserves.add(amount0In).sub(amount0Out);
  quickJpycReserves = quickJpycReserves.add(amount1In).sub(amount1Out);
  console.log("(Quick) event: ", [
    quickUsdcReserves.toString(),
    quickJpycReserves.toString(),
  ]);
  // 裁定機会のチェック
  const priceDiff = calFunc.rateDiff(
    quickJpycReserves,
    quickUsdcReserves,
    sushiJpycReserves,
    sushiUsdcReserves,
    config.tradeQuantity
  );

  // 裁定機会があるならアービトラージ
  if (priceDiff["QUICK/SUSHI"] > 0 && !nowArb) {
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
      console.log("swap is failed")
    }
    nowArb = false;
  }
  console.log("QUICK->SUSHI: ", priceDiff["QUICK/SUSHI"]);
  console.log("SUSHI->QUICK: ", priceDiff["SUSHI/QUICK"]);
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
  console.log("(Sushi) from:", senderAddress, "to:", to);
  if (amount0In.isZero()) console.log("usdc(out):", amount0Out.toString());
  if (amount0Out.isZero()) console.log("usdc(in): ", amount0In.toString());
  if (amount1In.isZero()) console.log("jpyc(out):", amount1Out.toString());
  if (amount1Out.isZero()) console.log("jpyc(in): ", amount1In.toString());
  sushiUsdcReserves = sushiUsdcReserves.add(amount0In).sub(amount0Out);
  sushiJpycReserves = sushiJpycReserves.add(amount1In).sub(amount1Out);
  console.log("(Sushi) event: ", [
    sushiUsdcReserves.toString(),
    sushiJpycReserves.toString(),
  ]);
  // 裁定機会のチェック
  const priceDiff = calFunc.rateDiff(
    quickJpycReserves,
    quickUsdcReserves,
    sushiJpycReserves,
    sushiUsdcReserves,
    config.tradeQuantity
  );
  console.log("QUICK->SUSHI: ", priceDiff["QUICK/SUSHI"]);
  console.log("SUSHI->QUICK: ", priceDiff["SUSHI/QUICK"]);
  
  // 裁定機会があるならアービトラージ
  if (priceDiff["SUSHI/QUICK"] > 0 && !nowArb) {
    nowArb = true;
    let bool;
    try {
      await arbFunc.dualDexTrade(
        address.ROUTER.SUSHISWAP,
        address.ROUTER.QUICKSWAP,
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
      console.log("swap is failed")
    }
    nowArb = false;
  }
  console.log(
    "----------------------------------------------------------------"
  );
};

const updateReserves = async () => {
  const quickReserves = await QuickContract.getReserves();
  const sushiReserves = await SushiContract.getReserves();
  [quickUsdcReserves, quickJpycReserves] = quickReserves;
  [sushiUsdcReserves, sushiJpycReserves] = sushiReserves;
  console.log("(Quick) first: ", [
    quickUsdcReserves.toString(),
    quickJpycReserves.toString(),
  ]);
  console.log("(Sushi) first: ", [
    sushiUsdcReserves.toString(),
    sushiJpycReserves.toString(),
  ]);
  const priceDiff = calFunc.rateDiff(
    quickJpycReserves,
    quickUsdcReserves,
    sushiJpycReserves,
    sushiUsdcReserves,
    config.tradeQuantity
  );
  console.log("QUICK->SUSHI: ", priceDiff["QUICK/SUSHI"]);
  console.log("SUSHI->QUICK: ", priceDiff["SUSHI/QUICK"]);
  console.log(
    "----------------------------------------------------------------"
  );

  // QuickContract.on("Swap", onSwapQuick);
  // SushiContract.on("Swap", onSwapSushi);

  setInterval(async () => {
    const quickLatestReserves = await QuickContract.getReserves();
    const sushiLatestReserves = await SushiContract.getReserves();
    [quickUsdcReserves, quickJpycReserves] = quickLatestReserves;
    [sushiUsdcReserves, sushiJpycReserves] = sushiLatestReserves;
    console.log("(Quick) latest:", [
      quickUsdcReserves.toString(),
      quickJpycReserves.toString(),
    ]);
    console.log("(Sushi) latest:", [
      sushiUsdcReserves.toString(),
      sushiJpycReserves.toString(),
    ]);
    console.log(
      "----------------------------------------------------------------"
    );
  }, 300000); // 5分
};
updateReserves();

// REST API
const app = express();
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
  profitFunc.add(profitCache, 10, 0);
  profitFunc.add(profitCache, 10.2, 0.2);
  profitFunc.add(profitCache, 10.3, 0.3);
  profitFunc.add(profitCache, 10.3, 0.3);
  profitFunc.add(profitCache, 10, 0);
  profitFunc.add(profitCache, 9.8, -0.2);
  profitFunc.add(profitCache, 9.9, -0.1);
};

app.get("/add/testdata", (req, res) => {
  res.send(add7Times());
});

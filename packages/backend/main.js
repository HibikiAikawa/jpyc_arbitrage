// .envファイルは適当に作ったアドレスを公開しているので秘密鍵は誰でも見れるようになっています
// イーサリアムアドレス: 0x23c14ba045f6a05de44b2d66d19c41e0c9fb3092
require("dotenv").config();
const fs = require("fs");
// const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");
const express = require("express");
const profitFunc = require("./profit");
// const eventFunc = require("./eventHandler");
const calFunc = require("./calculate");

const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const pairContractJSON = JSON.parse(
  fs.readFileSync("./contract/PancakePair.json", "utf8")
);
const pairContractAbi = pairContractJSON.abi;

// providerとcontractの作成
// TODO infra API取得
const provider = ethers.getDefaultProvider("matic");
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);
const QuickContract = new ethers.Contract(
  address.POOL.QUICKSWAP,
  pairContractAbi,
  signer
);
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

const onSwapQuick = (
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
};

const onSwapSushi = (
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

  QuickContract.on("Swap", onSwapQuick);
  SushiContract.on("Swap", onSwapSushi);

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
  }, 300000); // 5分
};
updateReserves();

// REST API
const app = express();
const server = app.listen(3002, () => {
  console.log("Node.js is listening to PORT:", server.address().port);
});

app.get("/rate", (req, res) => {
  res.send(
    calFunc.rate(
      quickJpycReserves,
      quickUsdcReserves,
      sushiJpycReserves,
      sushiUsdcReserves
    )
  );
});

app.get("/profit", (req, res) => {
  res.send(profitFunc.profit());
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

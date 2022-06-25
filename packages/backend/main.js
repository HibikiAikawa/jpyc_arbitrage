// .envファイルは適当に作ったアドレスを公開しているので秘密鍵は誰でも見れるようになっています
// イーサリアムアドレス: 0x49baaf328089899af4a65b5bc5e2739ae55bc455
require("dotenv").config();
const fs = require("fs");
// const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");
const express = require("express");
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

const onSwapQuick = (
  senderAddress,
  amount0In,
  amount1In,
  amount0Out,
  amount1Out,
  to
) => {
  console.log("(Quick) from:", senderAddress, "to:", to);
  if (amount0In.isZero()) console.log("jpyc(out):", amount0Out.toString());
  if (amount0Out.isZero()) console.log("jpyc(in): ", amount0In.toString());
  if (amount1In.isZero()) console.log("usdc(out):", amount1Out.toString());
  if (amount1Out.isZero()) console.log("usdc(in): ", amount1In.toString());
  quickJpycReserves = quickJpycReserves.add(amount0In).sub(amount0Out);
  quickUsdcReserves = quickUsdcReserves.add(amount1In).sub(amount1Out);
  console.log("event: ", [
    quickJpycReserves.toString(),
    quickUsdcReserves.toString(),
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
  if (amount0In.isZero()) console.log("jpyc(out):", amount0Out.toString());
  if (amount0Out.isZero()) console.log("jpyc(in): ", amount0In.toString());
  if (amount1In.isZero()) console.log("usdc(out):", amount1Out.toString());
  if (amount1Out.isZero()) console.log("usdc(in): ", amount1In.toString());
  sushiJpycReserves = sushiJpycReserves.add(amount0In).sub(amount0Out);
  sushiUsdcReserves = sushiUsdcReserves.add(amount1In).sub(amount1Out);
  console.log("event: ", [
    sushiJpycReserves.toString(),
    sushiUsdcReserves.toString(),
  ]);
};

const updateReserves = async () => {
  const quickReserves = await QuickContract.getReserves();
  const sushiReserves = await SushiContract.getReserves();
  [quickJpycReserves, quickUsdcReserves] = quickReserves;
  [sushiJpycReserves, sushiUsdcReserves] = sushiReserves;
  console.log("(Quick) first: ", [
    quickJpycReserves.toString(),
    quickUsdcReserves.toString(),
  ]);
  console.log("(Sushi) first: ", [
    sushiJpycReserves.toString(),
    sushiUsdcReserves.toString(),
  ]);

  QuickContract.on("Swap", onSwapQuick);
  SushiContract.on("Swap", onSwapSushi);

  setInterval(async () => {
    const quickLatestReserves = await QuickContract.getReserves();
    const sushiLatestReserves = await SushiContract.getReserves();
    [quickJpycReserves, quickUsdcReserves] = quickLatestReserves;
    [sushiJpycReserves, sushiUsdcReserves] = sushiLatestReserves;
    console.log("(Quick) latest:", [
      quickJpycReserves.toString(),
      quickUsdcReserves.toString(),
    ]);
    console.log("(Sushi) latest:", [
      sushiJpycReserves.toString(),
      sushiUsdcReserves.toString(),
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

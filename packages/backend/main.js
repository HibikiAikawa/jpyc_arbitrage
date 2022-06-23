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

// poolのトークン量の変数
let jpycReserves;
let usdcReserves;

const onSwap = (
  senderAddress,
  amount0In,
  amount1In,
  amount0Out,
  amount1Out,
  to
) => {
  console.log("from: ", senderAddress, "to: ", to);
  if (amount0In.isZero()) console.log("jpyc(out): ", amount0Out.toString());
  if (amount0Out.isZero()) console.log("jpyc(in): ", amount0In.toString());
  if (amount1In.isZero()) console.log("usdc(out): ", amount1Out.toString());
  if (amount1Out.isZero()) console.log("usdc(in): ", amount1In.toString());
  jpycReserves = jpycReserves.add(amount0In).sub(amount0Out);
  usdcReserves = usdcReserves.add(amount1In).sub(amount1Out);
  console.log("event: ", [jpycReserves.toString(), usdcReserves.toString()]);
};

const updateReserves = async () => {
  const reserves = await QuickContract.getReserves();
  [jpycReserves, usdcReserves] = reserves;
  console.log("first: ", [jpycReserves.toString(), usdcReserves.toString()]);

  QuickContract.on("Swap", onSwap);

  setInterval(async () => {
    const latestReserves = await QuickContract.getReserves();
    [jpycReserves, usdcReserves] = latestReserves; // 値がズレてるか確認せず代入
    console.log("latest:", [jpycReserves.toString(), usdcReserves.toString()]);
  }, 300000); // 5分
};
updateReserves();

// REST API
const app = express();
const server = app.listen(3002, () => {
  console.log("Node.js is listening to PORT:", server.address().port);
});

app.get("/rate", (req, res, next) => {
  res.send(calFunc.rate(jpycReserves, usdcReserves));
});

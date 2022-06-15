// .envファイルは適当に作ったアドレスを公開しているので秘密鍵は誰でも見れるようになっています
// イーサリアムアドレス: 0x49baaf328089899af4a65b5bc5e2739ae55bc455
require("dotenv").config();
const fs = require("fs");
// const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");
const express = require("express");

const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const pairContractJSON = JSON.parse(
  fs.readFileSync("./contract/PancakePair.json", "utf8")
);
const pairContractAbi = pairContractJSON.abi;

// providerとcontractの作成
// TODO infra API取得
const provider = ethers.getDefaultProvider("matic");
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);
const pairContract = new ethers.Contract(
  address.QUICKSWAP,
  pairContractAbi,
  signer
);

// emitされたイベントに反応する
const onMint = (senderAddress, amount0, amount1) => {
  console.log("senderAddress: ", senderAddress);
  console.log("amount0: ", amount0);
  console.log("amount1: ", amount1);
};

const onBurn = (senderAddress, amount0, amount1, to) => {
  console.log("senderAddress: ", senderAddress);
  console.log("amount0: ", amount0);
  console.log("amount1: ", amount1);
  console.log("to: ", to);
};

const onSwap = (
  senderAddress,
  amount0In,
  amount1In,
  amount0Out,
  amount1Out,
  to
) => {
  console.log("senderAddress: ", senderAddress);
  console.log("amount0In: ", amount0In, ", amount0Out: ", amount0Out);
  console.log("amount1In: ", amount1In, ", amount1Out: ", amount1Out);
  console.log("to: ", to);
};

pairContract.on("Mint", onMint);
pairContract.on("Burn", onBurn);
pairContract.on("Swap", onSwap);

// REST API
const app = express();
const server = app.listen(3002, () => {
  console.log("Node.js is listening to PORT:", server.address().port);
});

app.get("/test", (req, res, next) => {
  res.send("hello world");
  console.log(next);
});

// .envファイルは適当に作ったアドレスを公開しているので秘密鍵は誰でも見れるようになっています
// イーサリアムアドレス: 0x49baaf328089899af4a65b5bc5e2739ae55bc455
require("dotenv").config();
const fs = require("fs");
// const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");
const express = require("express");
const eventFunc = require("./eventHandler");
const profitFunc = require("./profit")

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

eventFunc.on(QuickContract);

// REST API
const app = express();
const server = app.listen(3002, () => {
  profitFunc.init();
  console.log("Node.js is listening to PORT:", server.address().port);
});

app.get("/all", (req, res) => {
  res.send(profitFunc.all());
});

app.get("/add", (req, res) => {
  res.send(profitFunc.add());
});

app.get("/profit", (req, res) => {
  res.send(profitFunc.profit());
});

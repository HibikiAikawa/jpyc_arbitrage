// .envファイルは適当に作ったアドレスを公開しているので秘密鍵は誰でも見れるようになっています
// イーサリアムアドレス: 0x49baaf328089899af4a65b5bc5e2739ae55bc455
require("dotenv").config();
const fs = require("fs");
// const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");
const express = require("express");
const eventFunc = require("./eventHandler");

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

let jpycReserves;
let usdcReserves;

const updateReserves = async () => {
  const reserves = await QuickContract.getReserves();
  [jpycReserves, usdcReserves] = reserves;
  console.log(
    "first: ",
    jpycReserves.toString(),
    ", ",
    usdcReserves.toString()
  );
  
  eventFunc.on(QuickContract, [jpycReserves, usdcReserves]);

  setInterval(async () => {
    const latestReserves = await QuickContract.getReserves();
    [jpycReserves, usdcReserves] = latestReserves; // 値がズレてるか確認せず代入
    console.log("latest: ", [jpycReserves.toString(), usdcReserves.toString()]);
  }, 300000); // 5分
};
updateReserves()

// REST API
const app = express();
const server = app.listen(3002, () => {
  console.log("Node.js is listening to PORT:", server.address().port);
});

app.get("/test", (req, res, next) => {
  res.send("hello world");
  console.log(next);
});

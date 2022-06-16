// .envファイルは適当に作ったアドレスを公開しているので秘密鍵は誰でも見れるようになっています
// イーサリアムアドレス: 0x49baaf328089899af4a65b5bc5e2739ae55bc455
require("dotenv").config();
const fs = require("fs");
// const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");
const express = require("express");
const eventFunc = require("./eventHandler");
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

eventFunc.on(QuickContract);

// poolのトークン量の変数
// TODO　gitanesさんにreserve周りの実装をしてもらいたいです！
let jpycReserves = ethers.BigNumber.from("1300000000000000000000000"); // BigNumber型で保持
let usdcReserves = ethers.BigNumber.from("10000000000"); //BigNumber型で保持
const amountIn_jpyc = 1300; // 取引量
const amountIn_usdc = 10;  // 取引量

// REST API
const app = express();
const server = app.listen(3002, () => {
  console.log("Node.js is listening to PORT:", server.address().port);
});

app.get("/rate", (req, res, next) => {
    const sellJPYC = calFunc.getRate(
        calFunc.strToFloat(address.TOKEN.JPYC.Decimals, jpycReserves.toString()),
        calFunc.strToFloat(address.TOKEN.USDC.Decimals, usdcReserves.toString()),
        amountIn_jpyc
        );
    const buyJPYC = calFunc.getRate(
        calFunc.strToFloat(address.TOKEN.USDC.Decimals, usdcReserves.toString()),
        calFunc.strToFloat(address.TOKEN.JPYC.Decimals, jpycReserves.toString()),
        amountIn_usdc
        );
    res.send({
        "QUICKSWAP":{
            "sell":amountIn_jpyc/sellJPYC,
            "buy":buyJPYC/amountIn_usdc
        },
        "SUSHISWAP":{
            "sell":0,
            "buy":0
        }
    });
  });
  
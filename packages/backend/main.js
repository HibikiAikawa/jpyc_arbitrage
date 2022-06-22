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

// poolのトークン量の変数
let jpycReserves =  ethers.BigNumber.from("0");
let usdcReserves =  ethers.BigNumber.from("0");;

const updateReserves = async () => {
  const reserves = await QuickContract.getReserves();
  [jpycReserves, usdcReserves] = reserves;
  console.log(
    "first: ",
    jpycReserves.toString(),
    ", ",
    usdcReserves.toString()
  );
  
  exports.reserves = [jpycReserves, usdcReserves]
  eventFunc.on(QuickContract, [jpycReserves, usdcReserves]);

  setInterval(async () => {
    console.log("calculate: ", [jpycReserves.toString(), usdcReserves.toString()]);
    const latestReserves = await QuickContract.getReserves();
    [jpycReserves, usdcReserves] = latestReserves; // 値がズレてるか確認せず代入
    console.log("latest: ", [jpycReserves.toString(), usdcReserves.toString()]);
  }, 300000); // 5分
};
updateReserves()

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

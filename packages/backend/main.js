// .envファイルは適当に作ったアドレスを公開しているので秘密鍵は誰でも見れるようになっています
// イーサリアムアドレス: 0x49baaf328089899af4a65b5bc5e2739ae55bc455
require("dotenv").config();

const fs = require('fs');
const address = JSON.parse(fs.readFileSync('./address.json', 'utf8'));
const pairContractJSON = JSON.parse(fs.readFileSync('./contract/PancakePair.json', 'utf8'));
const pairContractAbi = pairContractJSON.abi;
const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");
const express = require("express");
const app = express();

// providerとcontractの作成
// TODO infra API取得
const provider = ethers.getDefaultProvider('matic');
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);
const pairContract = new ethers.Contract(address.QUICKSWAP, pairContractAbi, signer);

const quickswap = require('./quickswapEventHandler');
quickswap.on(pairContract);

// REST API
const server = app.listen(3002, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.get("/test", function(req, res, next){
    res.send('hello world');
});
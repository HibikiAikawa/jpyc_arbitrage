require("dotenv").config();
const fs = require('fs');
const address = JSON.parse(fs.readFileSync('./address.json', 'utf8'));

const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");

// TODO infra API取得
const provider = ethers.getDefaultProvider('matic');
console.log(address.TOKEN.JPYC)

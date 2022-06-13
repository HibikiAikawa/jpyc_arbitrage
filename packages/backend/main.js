require("dotenv").config();
const fs = require('fs');
const address = JSON.parse(fs.readFileSync('./address.json', 'utf8'));

const Tx = require("ethereumjs-tx").Transaction;
const ethers = require("ethers");

const express = require("express");
const app = express();

// TODO infra API取得
const provider = ethers.getDefaultProvider('matic');
console.log(address.TOKEN.JPYC)

const server = app.listen(3002, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});


app.get("/test", function(req, res, next){
    res.send('hello world');
});
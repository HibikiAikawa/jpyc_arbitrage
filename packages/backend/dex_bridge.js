require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");
// const express = require("express");

const print = require("./utils/printer");
const utils = require("./utils/utils");
const eventFunc = require("./eventHandler");
// const calFunc = require("./calculate");
// const arbFunc = require("./arbHandler");
// const printFunc = require("./printer");

// const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const address = JSON.parse(fs.readFileSync("./address_test.json", "utf8"));
// const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

// 各プールのトークン保有量
let tokenReserves = utils.createTokenJson(address);

const onUpdate = (variable) => {
  console.log("caught Update event in main.js");
  const { chain, dex, pair, token0Reserves, token1Reserves } = variable;
  const tokens = utils.sortTokens(address, chain, pair);

  tokenReserves[chain][dex][pair][tokens[0]] = token0Reserves;
  tokenReserves[chain][dex][pair][tokens[1]] = token1Reserves;
  print.printTokenReserves(tokenReserves);
};

const main = async () => {
  await eventFunc.startPoolTrack(address);
  eventFunc.dexEvent.on("Update", onUpdate);
  eventFunc.dexEvent.on("Swap", (variable) => {
    console.log("caught Swap event in main.js");
  });
  eventFunc.dexEvent.on("Mint", (variable) => {
    console.log("caught Mint event in main.js");
  });
  eventFunc.dexEvent.on("Burn", (variable) => {
    console.log("caught Burn event in main.js");
  });
};

main();

/*
// REST API
const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTION"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const server = app.listen(3002, () => {
  console.log("Node.js is listening to PORT:", server.address().port);
});

app.get("/rate", (req, res) => {
  res.send({
    status: true,
    body: calFunc.rate(
      quickJpycReserves,
      quickUsdcReserves,
      sushiJpycReserves,
      sushiUsdcReserves
    ),
  });
});

app.get("/profit", (req, res) => {
  res.send(profitFunc.profit());
});

app.get("/result/:n", (req, res) => {
  res.send(profitFunc.result(req.params.n));
});

app.get("/add/testdata", (req, res) => {
  res.send(add7Times());
});
*/

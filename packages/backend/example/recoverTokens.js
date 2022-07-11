const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));
const address = JSON.parse(
  fs.readFileSync(`./config/${config.file.address}`, "utf8")
);
const arbFunc = require("../arbHandler");

const main = async () => {
  console.log("recover JPYC.");
  await arbFunc.recoverTokens(address.TOKEN.JPYC.Address);
  console.log("recover USDC.");
  await arbFunc.recoverTokens(address.TOKEN.USDC.Address);
};

main();

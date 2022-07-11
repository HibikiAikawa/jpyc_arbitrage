const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));

const address = JSON.parse(
  fs.readFileSync(`./config/${config.file.address}`, "utf8")
);
const arbFunc = require("../arbHandler");

const main = async () => {
  console.log("approve : USDC, QUICKSWAP");
  await arbFunc.approve(
    address.TOKEN.USDC.Address,
    address.ROUTER.QUICKSWAP,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
  console.log("approve : USDC, SUSHISWAP");
  await arbFunc.approve(
    address.TOKEN.USDC.Address,
    address.ROUTER.SUSHISWAP,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
  console.log("approve : JPYC, QUICKSWAP");
  await arbFunc.approve(
    address.TOKEN.JPYC.Address,
    address.ROUTER.QUICKSWAP,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
  console.log("approve : JPYC, SUSHISWAP");
  await arbFunc.approve(
    address.TOKEN.JPYC.Address,
    address.ROUTER.SUSHISWAP,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
};

main();

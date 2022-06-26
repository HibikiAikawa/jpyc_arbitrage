const fs = require("fs");

const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const arbFunc = require("./arbHandler");

const main = async () => {
  await arbFunc.approve(
    address.TOKEN.USDC.Contract,
    address.ROUTER.QUICKSWAP,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
  await arbFunc.approve(
    address.TOKEN.USDC.Contract,
    address.ROUTER.SUSHISWAP,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
  await arbFunc.approve(
    address.TOKEN.JPYC.Contract,
    address.ROUTER.QUICKSWAP,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
  await arbFunc.approve(
    address.TOKEN.JPYC.Contract,
    address.ROUTER.SUSHISWAP,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
};

main();

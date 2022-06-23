require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");

const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const arbitrageContractJSON = JSON.parse(
  fs.readFileSync("./contract/Arbitrage.json", "utf8")
);
const arbitrageContractAbi = arbitrageContractJSON.abi;

const userAddress = "0x23c14ba045f6a05de44b2d66d19c41e0c9fb3092";

const provider = ethers.getDefaultProvider("matic");
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);
const ArbitrageContract = new ethers.Contract(
  address.ARBITRAGE,
  arbitrageContractAbi,
  signer
);

const swap = async (amountIn, to, deadline, path, router, amountOutMin) => {
  console.log("start swap");

  const txCount = await provider.getTransactionCount(userAddress);
  const overrides = {
    nonce: ethers.utils.hexlify(txCount),
    gasLimit: ethers.BigNumber.from("2000000").toHexString(),
    gasPrice: ethers.BigNumber.from("60000000000").toHexString(),
  };
  const tx = await ArbitrageContract.swap(
    amountIn,
    to,
    deadline,
    path,
    router,
    amountOutMin,
    overrides
  );
  await tx.wait();
  console.log("finish swap");
};

const getAmount = async (amountIn, path, router) => {
  console.log("get amount");

  const txCount = await provider.getTransactionCount(userAddress);
  const overrides = {
    nonce: ethers.utils.hexlify(txCount),
    gasLimit: ethers.BigNumber.from("2000000").toHexString(),
    gasPrice: ethers.BigNumber.from("60000000000").toHexString(),
  };
  const tx = await ArbitrageContract.getAmountOutMin(
    amountIn,
    path,
    router,
    overrides
  );
  console.log("return: ", tx[0].toString(), tx[1].toString());
};

const arbitrage = async (
  amountIn,
  to,
  deadline,
  inPath,
  outPath,
  tokenAddress,
  inRouter,
  outRouter,
  amountOutMin
) => {
  console.log("start arbitrage");

  const txCount = await provider.getTransactionCount(userAddress);
  const overrides = {
    nonce: ethers.utils.hexlify(txCount),
    gasLimit: ethers.BigNumber.from("2000000").toHexString(),
    gasPrice: ethers.BigNumber.from("60000000000").toHexString(),
  };
  const tx = await ArbitrageContract.arbitrage(
    amountIn,
    to,
    deadline,
    inPath,
    outPath,
    tokenAddress,
    inRouter,
    outRouter,
    amountOutMin,
    overrides
  );
  await tx.wait();
  console.log("finish arbitrage");
};

const dexSwap = async(
  amountIn,
  amountOutMin,
  path,
  to,
  deadline
) => { 
  const dexContractJSON = JSON.parse(
    fs.readFileSync("./contract/PancakeRouter.json", "utf8")
  );
  const dexContractAbi = dexContractJSON.abi;
  const sushiContract = new ethers.Contract(address.ROUTER.SUSHISWAP, dexContractAbi, signer);
  const txCount = await provider.getTransactionCount(userAddress);
  const overrides = {
    nonce: ethers.utils.hexlify(txCount),
    gasLimit: ethers.BigNumber.from("2000000").toHexString(),
    gasPrice: ethers.BigNumber.from("60000000000").toHexString(),
  };
  console.log('swap begin');
  const tx = await sushiContract.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline, overrides);
  await tx.wait();
  console.log('swap end');
};

const amountIn = ethers.BigNumber.from(
  0.5 * 10 ** address.TOKEN.USDC.Decimals //ethers.utils.parseEther('10')
).toHexString();
const to = userAddress;
const inPath = [address.TOKEN.USDC.Contract, address.TOKEN.JPYC.Contract];
const outPath = [address.TOKEN.JPYC.Contract, address.TOKEN.USDC.Contract];
let deadline = Math.floor(Date.now() / 1000) + 60 * 20;
deadline = ethers.BigNumber.from(String(deadline)).toHexString();
const inRouter = address.ROUTER.SUSHISWAP;
const outRouter = address.ROUTER.QUICKSWAP;
const amountOutMin = ethers.BigNumber.from(1).toHexString();
const tokenAddress = address.TOKEN.USDC.Contract;

/* 
dexSwap(amountIn, amountOutMin, inPath, to, deadline); 
*/

/*
arbitrage(
  amountIn,
  to,
  deadline,
  inPath,
  outPath,
  tokenAddress,
  inRouter,
  outRouter,
  amountOutMin
);
*/

/* swap(
    amountIn,
    to,
    deadline,
    inPath,
    inRouter,
    amountOutMin
); 
 */

/* 
getAmount(
  amountIn,
  inPath,
  outRouter
) 
*/

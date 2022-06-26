require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");

const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const arbitrageContractJSON = JSON.parse(
  fs.readFileSync("./contract/Arbitrage.json", "utf8")
);
const arbitrageContractAbi = arbitrageContractJSON.abi;

const provider = ethers.getDefaultProvider("matic");
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);
const ArbitrageContract = new ethers.Contract(
  address.ARBITRAGE,
  arbitrageContractAbi,
  signer
);

const dualDexTrade = async (_router1, _router2, _token1, _token2, _amount) => {
  const txCount = await provider.getTransactionCount(address.WALLET);
  const overrides = {
    nonce: ethers.utils.hexlify(txCount),
    gasLimit: ethers.BigNumber.from(config.gasLimit).toHexString(),
    gasPrice: ethers.BigNumber.from(config.gasPrice).toHexString(),
  };
  const tx = await ArbitrageContract.dualDexTrade(
    _router1,
    _router2,
    _token1,
    _token2,
    _amount,
    overrides
  );
  await tx.wait();
};

const recoverTokens = async (_tokenAddress) => {
  const txCount = await provider.getTransactionCount(address.WALLET);
  const overrides = {
    nonce: ethers.utils.hexlify(txCount),
    gasLimit: ethers.BigNumber.from(config.gasLimit).toHexString(),
    gasPrice: ethers.BigNumber.from(config.gasPrice).toHexString(),
  };
  await ArbitrageContract.recoverTokens(_tokenAddress, overrides);
};

const getBalance = async (_tokenAddress) => {
  const balance = await ArbitrageContract.getBalance(_tokenAddress);
  return balance;
};

const approve = async (token, spender, amount) => {
  const txCount = await provider.getTransactionCount(address.WALLET);
  const overrides = {
    nonce: ethers.utils.hexlify(txCount),
    gasLimit: ethers.BigNumber.from(config.gasLimit).toHexString(),
    gasPrice: ethers.BigNumber.from(config.gasPrice).toHexString(),
  };
  const tx = await ArbitrageContract.approve(token, spender, amount, overrides);
  await tx.wait();
};

exports.getBalance = getBalance;
exports.approve = approve;
exports.recoverTokens = recoverTokens;
exports.dualDexTrade = dualDexTrade;

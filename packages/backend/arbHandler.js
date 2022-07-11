require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");

const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));
const address = JSON.parse(
  fs.readFileSync(`./config/${config.file.address}`, "utf8")
);
const arbitrageContractJSON = JSON.parse(
  fs.readFileSync("./contract/Arbitrage.json", "utf8")
);
const arbitrageContractAbi = arbitrageContractJSON.abi;

const provider = ethers.getDefaultProvider("matic");
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);
const ArbitrageContract = new ethers.Contract(
  address.CONTRACT,
  arbitrageContractAbi,
  signer
);

/**
 * アービトラージを行う部分
 * @param {string} _router1 - 交換元トークンを交換先トークンに替えるルーターアドレス
 * @param {string} _router2 - 交換先トークンを交換元トークンに戻すルーターアドレス
 * @param {string} _token1 - 交換元トークンのアドレス
 * @param {string} _token2 - 交換先トークンのアドレス
 * @param {string} _amount - 交換元トークンの量
 */
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

/**
 * コントラクトからウォレットにERC20トークンを戻す関数
 * @param {string} _tokenAddress - 貰うERC20トークンのアドレス
 */
const recoverTokens = async (_tokenAddress) => {
  const txCount = await provider.getTransactionCount(address.WALLET);
  const overrides = {
    nonce: ethers.utils.hexlify(txCount),
    gasLimit: ethers.BigNumber.from(config.gasLimit).toHexString(),
    gasPrice: ethers.BigNumber.from(config.gasPrice).toHexString(),
  };
  const tx = await ArbitrageContract.recoverTokens(_tokenAddress, overrides);
  await tx.wait();
};

/**
 * コントラクトにあるトークン残高を返す関数
 * @param {string} _tokenAddress - 調べたいトークンのアドレス
 * @returns トークン残高
 */
const getBalance = async (_tokenAddress) => {
  const balance = await ArbitrageContract.getBalance(_tokenAddress);
  return balance;
};

/**
 * ERC20におけるapprove関数と同じ。ルーターからコントラクトアドレスのトークン操作を許可する。
 * @param {string} token - approveしたいトークンのアドレス
 * @param {string} spender - routerのコントラクトアドレス
 * @param {string} amount - approveで許容するトークン量
 */
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

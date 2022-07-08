/**
 * DEXに登録されているプールの中から指定したtokenAddressを含んでいるかを調べる
 * 含んでいた場合プールのアドレス情報ともう片方のトークン情報をjsonに保存
 */
require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");

const factoryAbi = require("@uniswap/v2-core/build/IUniswapV2Factory.json").abi;
const pairAbi = require("@uniswap/v2-core/build/IUniswapV2Pair.json").abi;
const tokenAbi = require("@uniswap/v2-core/build/IUniswapV2ERC20.json").abi;

const calcFunc = require("../calculate");

const address = JSON.parse(
  fs.readFileSync("./config/address_test.json", "utf8")
);

const provider = ethers.getDefaultProvider("matic");
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);

// 指定トークンがthreshold以下しかreserveされていないプールは無視
const threshold = 10000;

const getTokenInfo = async (tokenAddress) => {
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  return { symbol, decimals };
};

/**
 *
 * @param {object} tokenJson - name, address, decimalsを含んだJSON
 * @param {string} dexFactoryAddress - DEXのfactoryアドレス
 */
const getTokenPools = async (tokenJson, dexFactoryAddress) => {
  const pools = [];
  const factoryContract = new ethers.Contract(
    dexFactoryAddress,
    factoryAbi,
    signer
  );

  const pairsLength = await factoryContract.allPairsLength();

  console.log("pairsLength", pairsLength);

  // 調査用に100で区切る
  // for (let i = 0; i < pairsLength; i += 1) {
  for (let i = 0; i < 50; i += 1) {
    const poolAddress = await factoryContract.allPairs(i);

    console.log("poolAddress", poolAddress);
    const poolContract = new ethers.Contract(poolAddress, pairAbi, signer);
    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();
    const reserves = await poolContract.getReserves();
    const [reserve0, reserve1] = reserves;
    const reserve0Float = calcFunc.strToFloat(
      tokenJson.Decimals,
      reserve0.toString()
    );
    const reserve1Float = calcFunc.strToFloat(
        tokenJson.Decimals,
      reserve1.toString()
    );

    if (tokenJson.Address === token0 && reserve0Float > threshold) {
      const { symbol, decimals } = await getTokenInfo(token1);
      console.log("usdc pool");
      console.log("token addr:", token1);
      console.log("symbol:", symbol);
      console.log("decimals:", decimals);
      const poolInfo = {"NAME":`${tokenJson.NAME}/${symbol}`, "Address":poolAddress};
      const tokenInfo = {"NAME":symbol, "Address":token1, "Decimals":decimals}
      pools.push({"POOL":poolInfo, "TOKEN":tokenInfo})
      break
    }
    if (tokenJson.Address === token1 && reserve1Float > threshold) {
      const { symbol, decimals } = await getTokenInfo(token0);
      console.log("usdc pool");
      console.log("token addr:", token0);
      console.log("symbol:", symbol);
      console.log("decimals:", decimals);
      const poolInfo = {"NAME":`${tokenJson.NAME}/${symbol}`, "Address":poolAddress};
      const tokenInfo = {"NAME":symbol, "Address":token0, "Decimals":decimals}
      pools.push({"POOL":poolInfo, "TOKEN":tokenInfo})
      break;
    }
    console.log("next.");
  }
  console.log(pools)
};

const tokenJson = {
  NAME: "USDC",
  Address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  Decimals: 6,
};

getTokenPools(tokenJson, address.FACTORY.QUICKSWAP, "QUICKSWAP");

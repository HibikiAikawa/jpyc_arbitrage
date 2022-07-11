/**
 * 同一ブロックチェーン上にある2つのDEX上に同一のプールがないかをチェックし、JSONファイルに出力する。この時基軸トークンを一つ選択する。
 * 例えばUSDCを基軸トークンとして選択した場合二つのDEX上でUSDC/TokenAというプールが両方のDEXにあるかを調べて、ある場合に抽出する。
 * 現状は2つ以上のプールをまたぐ調査はできない。
 */
require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");

const factoryAbi = require("@uniswap/v2-core/build/IUniswapV2Factory.json").abi;
const pairAbi = require("@uniswap/v2-core/build/IUniswapV2Pair.json").abi;
const tokenAbi = require("@uniswap/v2-core/build/IUniswapV2ERC20.json").abi;

const calcFunc = require("../calculate");
const utils = require("../utils/utils");

const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));

const address = JSON.parse(
  fs.readFileSync(`./config/${config.file.address}`, "utf8")
);
const path = JSON.parse(
  fs.readFileSync(`./config/${config.file.path}`, "utf8")
);

const provider = ethers.getDefaultProvider("matic");
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, provider);

/**
 * コントラクトアドレスに問い合わせてトークン情報を取得する
 * @param {string} tokenAddress - トークンのコントラクトアドレス
 * @returns トークンのsymbol名とdesimal
 */
const getTokenInfo = async (tokenAddress) => {
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  return { symbol, decimals };
};

/**
 * dexFactoryAdderssでしたDEXのプールペアを全てチェックし、tokenJsonに含まれるトークンを持っているpoolペアを抽出する
 * @param {object} tokenJson - name, address, decimalsを含んだJSON
 * @param {string} dexFactoryAddress - DEXのfactoryアドレス
 * @param {int} threshold - tokenJsonで指定されたトークンのステーク量の閾値。ステークされている量がthreshold以下だった場合は記録しない
 */
const getTokenPools = async (tokenJson, dexFactoryAddress, threshold) => {
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
      const [name0, name1] = utils.sortStr(tokenJson.NAME, symbol);
      const poolInfo = {
        NAME: `${name0}/${name1}`,
        Address: poolAddress,
      };
      const tokenInfo = { NAME: symbol, Address: token1, Decimals: decimals };
      pools.push({ POOL: poolInfo, TOKEN: tokenInfo });
    }
    if (tokenJson.Address === token1 && reserve1Float > threshold) {
      const { symbol, decimals } = await getTokenInfo(token0);
      console.log("usdc pool");
      console.log("token addr:", token0);
      console.log("symbol:", symbol);
      console.log("decimals:", decimals);
      const [name0, name1] = utils.sortStr(tokenJson.NAME, symbol);
      const poolInfo = {
        NAME: `${name0}/${name1}`,
        Address: poolAddress,
      };
      const tokenInfo = { NAME: symbol, Address: token0, Decimals: decimals };
      pools.push({ POOL: poolInfo, TOKEN: tokenInfo });
    }
    console.log("next.");
  }
  return pools;
};

/**
 * 2つのDEXに対してgetTokenPoolsを行い、被ったPoolを抽出
 * (被った部分はアービトラージの候補になり得る)
 * @param {string} _tokenJson
 * @param {string} _factory0
 * @param {string} _factory1
 * @param {string} _dexName0
 * @param {string} _dexName1
 * @param {int} threshold - tokenJsonで指定されたトークンのステーク量の閾値。ステークされている量がthreshold以下だった場合は記録しない
 * @returns 2つのDEXのプールで被ったトークンペア
 */
const compareDexes = async (
  tokenJson,
  factory0,
  factory1,
  dexName0,
  dexName1,
  threshold
) => {
  const arbitragePathes = [];
  const pool0 = await getTokenPools(tokenJson, factory0, threshold);
  const pool1 = await getTokenPools(tokenJson, factory1, threshold);

  for (let i = 0; i < pool0.length; i += 1) {
    const pairName0 = pool0[i].POOL.NAME;
    const tokenAddress0 = pool0[i].TOKEN.Address;
    for (let j = 0; j < pool1.length; j += 1) {
      const pairName1 = pool1[j].POOL.NAME;
      const tokenAddress1 = pool1[j].TOKEN.Address;
      if (pairName0 === pairName1 && tokenAddress0 === tokenAddress1) {
        const arbitragePath = { POOL: {}, TOKEN: "" };
        arbitragePath.POOL[dexName0] = pool0[i].POOL;
        arbitragePath.POOL[dexName1] = pool1[j].POOL;
        arbitragePath.TOKEN = pool0[i].TOKEN;
        arbitragePathes.push(arbitragePath);
      }
    }
  }
  return arbitragePathes;
};

/**
 * 抽出されたアービトラージのプールデータ(arbitragePathes)を元にJSONファイルに整形する
 * @param {object} tokenJson - アービトラージの軸になるトークンの情報
 * @param {string} dexName0 - DEX名
 * @param {string} dexName1 - DEX名
 * @param {string} chain - ブロックチェーン名（ブロックチェーンをまたぐアービトラージは考慮していない）
 * @param {list} arbitragePathes - compareDexesで抽出されたアービトラージできるプールのリスト
 * @param {string} addressName - address.jsonの出力ファイル名
 * @param {string} pathName - path.jsonの出力ファイル名
 */
const encodeJson = (tokenJson, dexName0, dexName1, chain, arbitragePathes) => {
  const retAddress = JSON.parse(
    fs.readFileSync(`./config/${config.file.address}`, "utf8")
  );
  const retPath = JSON.parse(
    fs.readFileSync(`./config/${config.file.path}`, "utf8")
  );
  for (let i = 0; i < arbitragePathes.length; i += 1) {
    // address.jsonにDEX名はあること前提
    // address.jsonの上書き
    Object.keys(arbitragePathes[i].POOL).forEach((dexKey) => {
      if (
        retAddress.POOL[chain][dexKey][arbitragePathes[i].POOL[dexKey].NAME] ===
        undefined
      ) {
        retAddress.POOL[chain][dexKey][arbitragePathes[i].POOL[dexKey].NAME] =
          arbitragePathes[i].POOL[dexKey].Address;
      } else {
        console.log(
          `${chain}-${dexKey}-${arbitragePathes[i].POOL[dexKey].NAME} pool is already exist.`
        );
        console.log(
          `pool address : ${arbitragePathes[i].POOL[dexKey].Address}`
        );
      }
    });

    if (retAddress.TOKEN[chain][arbitragePathes[i].TOKEN.NAME] === undefined) {
      retAddress.TOKEN[chain][arbitragePathes[i].TOKEN.NAME] = {
        Address: arbitragePathes[i].TOKEN.Address,
        Decimals: arbitragePathes[i].TOKEN.Decimals,
      };
    } else {
      console.log(
        `${chain}-${arbitragePathes[i].TOKEN.NAME} token is already exist.`
      );
      console.log(`token address : ${arbitragePathes[i].TOKEN.Address}`);
    }
    // path.jsonの上書き
    const dexPair = `${dexName0}/${dexName1}`;
    const [token0, token1] = utils.sortStr(
      tokenJson.NAME,
      arbitragePathes[i].TOKEN.NAME
    );
    const tokenPair = `${token0}/${token1}`;
    // dexPairはpathに既にある前提
    const pathList = [];
    Object.keys(arbitragePathes[i].POOL).forEach((dexKey) => {
      const pathInfo = {
        CHAIN: chain,
        DEX: dexKey,
        PAIR: tokenPair,
      };
      pathList.push(pathInfo);
    });
    if (retPath[dexPair][tokenPair] === undefined) {
      retPath[dexPair][tokenPair] = { PATH: pathList, TOKEN: tokenJson.NAME };
    } else {
      console.log(`${dexPair} - ${tokenPair} is already exist (path.json).`);
    }

    retPath[dexPair][tokenPair] = { PATH: pathList, TOKEN: tokenJson.NAME };
  }
  return [retAddress, retPath];
};

const main = async (
  tokenJson,
  factory0,
  factory1,
  dexName0,
  dexName1,
  chain,
  threshold,
  addressName,
  pathName
) => {
  const arbitragePathes = await compareDexes(
    tokenJson,
    factory0,
    factory1,
    dexName0,
    dexName1,
    threshold
  );

  const [retAddress, retPath] = encodeJson(
    tokenJson,
    dexName0,
    dexName1,
    chain,
    arbitragePathes,
    addressName,
    pathName
  );
  console.log(retAddress)

  fs.writeFile(
    `./config/${addressName}`,
    JSON.stringify(retAddress, undefined, 2),
    (err) => {
      if (err) console.log(`error!::${err}`);
    }
  );
  fs.writeFile(
    `./config/${pathName}`,
    JSON.stringify(retPath, undefined, 2),
    (err) => {
      if (err) console.log(`error!::${err}`);
    }
  );
};

// config情報
// 指定トークンがthreshold以下しかreserveされていないプールは無視
const threshold = 10000;

const tokenJson = {
  NAME: "USDC",
  Address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  Decimals: 6,
};

const chain = "MATIC";
const factory0 = address.FACTORY.QUICKSWAP;
const factory1 = address.FACTORY.SUSHISWAP;
const dexNameA = "QUICKSWAP";
const dexNameB = "SUSHISWAP";
const [dexName0, dexName1] = utils.sortStr(dexNameA, dexNameB);

const addressName = "address_test.json";
const pathName = "path_test.json";

main(
  tokenJson,
  factory0,
  factory1,
  dexName0,
  dexName1,
  chain,
  threshold,
  addressName,
  pathName
);

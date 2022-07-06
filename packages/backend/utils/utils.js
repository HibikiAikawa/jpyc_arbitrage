const ethers = require("ethers");

/**
 * address.jsonのPOOLを参考に各プールのトークン量を記録するObjectの作成
 * @param {string} addressJson - address.json
 * @return {object} 各プールに格納されているトークン量
 */
const createTokenJson = (addressJson) => {
  // deepcopy
  const pools = JSON.parse(JSON.stringify(addressJson)).POOL;
  Object.keys(pools).forEach((chainKey) => {
    Object.keys(pools[chainKey]).forEach((dexKey) => {
      Object.keys(pools[chainKey][dexKey]).forEach((pairKey) => {
        const tokenName = pairKey.match(/(\w+)\/(\w+)/);
        pools[chainKey][dexKey][pairKey] = {};
        pools[chainKey][dexKey][pairKey][tokenName[1]] =
          ethers.BigNumber.from("0");
        pools[chainKey][dexKey][pairKey][tokenName[2]] =
          ethers.BigNumber.from("0");
      });
    });
  });
  return pools;
};

/**
 * 2つのトークンペアを比較してソートする
 * コントラクトアドレスの大きさで比較する
 * @param {string} address - address.json
 * @param {string} chain - トークンペアがデプロイされているチェーンの名前
 * @param {string} dex - トークンペアがデプロイされているDEXの名前
 * @param {string} pair - トークンペア名
 * @returns ソートされたトークンペア(小さい順)
 */
const sortTokens = (address, chain, pair) => {
  const tokenName = pair.match(/(\w+)\/(\w+)/);
  const tokenA = address.TOKEN[chain][tokenName[1]].Address;
  const tokenB = address.TOKEN[chain][tokenName[2]].Address;
  let token0;
  let token1;
  if (tokenA < tokenB) {
    [token0, token1] = [tokenName[1], tokenName[2]];
  } else {
    [token0, token1] = [tokenName[2], tokenName[1]];
  }
  return [token0, token1];
};

exports.createTokenJson = createTokenJson;
exports.sortTokens = sortTokens;

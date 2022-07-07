const fs = require("fs");

const address = JSON.parse(fs.readFileSync("./config/address.json", "utf8"));
const path = JSON.parse(fs.readFileSync("./config/path.json", "utf8"));
// const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

/**
 * BigNumberをfloat型に計算しなおす
 * @param {int} decimals - トークンに設定されているdecimals
 * @param {string} amount - BigNumberのstring型
 * @param {int} minimum - 計算する小数の桁数
 * @returns
 */
const strToFloat = (decimals, amount, minimum = 5) => {
  const alignedAmount = amount.substring(
    0,
    amount.length - (decimals - minimum)
  );
  const floatAmount = parseFloat(alignedAmount) / 10 ** minimum;
  return floatAmount;
};

/**
 * プールのトークン量と取引するトークン量からレートを計算する
 * @param {int} reserveIn - 預けるトークンのステーク量
 * @param {float} reserveOut - 受け取るトークンのステーク量
 * @param {float} amountIn -  トークンの交換量
 * @param {float} margin - DEXに設定されている手数料
 * @returns - 受け取るトークン量
 */
const getAmount = (reserveIn, reserveOut, amountIn, margin = 0.3) => {
  const amountInWithFee = amountIn * (100 - margin);
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 100 + amountInWithFee;
  const amountOut = numerator / denominator;
  return amountOut;
};

/**
 * _pathで指定されたプールに沿ってSwapする
 * @param {object} tokenReserves - 全プールの保有トークン量
 * @param {list} _path - Swapするプールのリスト
 * @param {float} amountIn - 最初にスワップするトークン量(ether建)
 * @param {string} startTokenName - 最初にスワップする手持ちトークン名
 * @returns 最終的に返ってくるトークン量
 */
const getAmounts = (tokenReserves, _path, amountIn, startTokenName) => {
  let retAmount = amountIn;
  let tokenIn = startTokenName;
  let reserveOut;
  for (let i = 0; i < _path.length; i += 1) {
    const { CHAIN, DEX, PAIR } = _path[i];
    const reserveIn = strToFloat(
      address.TOKEN[CHAIN][tokenIn].Decimals,
      tokenReserves[CHAIN][DEX][PAIR][tokenIn].toString()
    );
    // pairに記載されているペア名の抽出
    const [, token0Name, token1Name, ,] = PAIR.match(/(\w+)\/(\w+)/);
    if (tokenIn === token0Name) {
      reserveOut = strToFloat(
        address.TOKEN[CHAIN][token1Name].Decimals,
        tokenReserves[CHAIN][DEX][PAIR][token1Name].toString()
      );
      tokenIn = token1Name;
    } else {
      reserveOut = strToFloat(
        address.TOKEN[CHAIN][token0Name].Decimals,
        tokenReserves[CHAIN][DEX][PAIR][token0Name].toString()
      );
      tokenIn = token0Name;
    }
    retAmount = getAmount(reserveIn, reserveOut, retAmount);
  }
  return retAmount;
};

/**
 * path.jsonに書かれているアービトラージペアの推定収益を計算
 * @param {object} tokenReserves - 全プールの保有トークン量
 */
const estimateProfit = (tokenReserves) => {
  console.log("estimate price diff");
  Object.keys(path).forEach((pairKey) => {
    // TODO 交換トークンの最適化必要
    const amountIn = 1;
    const retAmount = getAmounts(
      tokenReserves,
      path[pairKey].PATH,
      amountIn,
      path[pairKey].TOKEN
    );
    console.log(pairKey, retAmount - amountIn);
  });
};

/**
 * GET /rateのレスポンス
 * @param {ethers.ethers.BigNumber} quickJpycReserves - QuickSwapプールのJPYC量
 * @param {ethers.ethers.BigNumber} quickUsdcReserves - QuickSwapプールのUSDC量
 * @param {ethers.ethers.BigNumber} sushiJpycReserves - SushiSwapプールのJPYC量
 * @param {ethers.ethers.BigNumber} sushiUsdcReserves - SushiSwapプールのUSDC量
 * @returns - オブジェクト
 */
const rate = (
  quickJpycReserves,
  quickUsdcReserves,
  sushiJpycReserves,
  sushiUsdcReserves
) => {
  // amountInJpyc売って、買えるquickOutUsdc
  const quickOutUsdc = getAmount(
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    config.amountInJpyc
  );
  // amountInUsdc売って、買えるquickOutJpyc
  const quickOutJpyc = getAmount(
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    config.amountInUsdc
  );
  // amountInJpyc売って、買えるsushiOutUsdc
  const sushiOutUsdc = getAmount(
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    config.amountInJpyc
  );
  // amountInUsdc売って、買えるsushikOutJpyc
  const sushiOutJpyc = getAmount(
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    config.amountInUsdc
  );

  const quickSellJpycRate = config.amountInJpyc / quickOutUsdc;
  const quickBuyJpycRate = quickOutJpyc / config.amountInUsdc;
  const quickAverageRate = (quickSellJpycRate + quickBuyJpycRate) / 2;

  const sushiSellJpycRate = config.amountInJpyc / sushiOutUsdc;
  const sushiBuyJpycRate = sushiOutJpyc / config.amountInUsdc;
  const sushiAverageRate = (sushiSellJpycRate + sushiBuyJpycRate) / 2;

  return {
    QUICKSWAP: {
      sell: quickSellJpycRate,
      buy: quickBuyJpycRate,
      jpycReserves: strToFloat(
        address.TOKEN.JPYC.Decimals,
        quickJpycReserves.toString()
      ),
      usdcReserves: strToFloat(
        address.TOKEN.USDC.Decimals,
        quickUsdcReserves.toString()
      ),
      liquidity:
        strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()) /
          sushiAverageRate +
        strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    },
    SUSHISWAP: {
      sell: sushiSellJpycRate,
      buy: sushiBuyJpycRate,
      jpycReserves: strToFloat(
        address.TOKEN.JPYC.Decimals,
        sushiJpycReserves.toString()
      ),
      usdcReserves: strToFloat(
        address.TOKEN.USDC.Decimals,
        sushiUsdcReserves.toString()
      ),
      liquidity:
        strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()) /
          quickAverageRate +
        strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    },
  };
};

/**
 * 交換トークン量とプールのステーク量を考慮したアービトラージの利益額の計算
 * @param {ethers.ethers.BigNumber} quickJpycReserves - QuickSwapプールのJPYC量
 * @param {ethers.ethers.BigNumber} quickUsdcReserves - QuickSwapプールのUSDC量
 * @param {ethers.ethers.BigNumber} sushiJpycReserves - SushiSwapプールのJPYC量
 * @param {ethers.ethers.BigNumber} sushiUsdcReserves - SushiSwapプールのUSDC量
 * @param {float} amountIn - トークン量
 * @returns - オブジェクト
 */
const rateDiff = (
  quickJpycReserves,
  quickUsdcReserves,
  sushiJpycReserves,
  sushiUsdcReserves,
  amountIn
) => {
  // amountIn(USDC) -> quickOutJPYC(JPYC) -> sushiOutUsdc(USDC)で裁定機会を探る
  // USDC -> QUICKSWAP -> JPYC
  const quickOutJpyc = getAmount(
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    amountIn
  );
  // JPYC -> SUSHISWAP -> USDC
  const sushiOutUsdc = getAmount(
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    quickOutJpyc
  );

  // amountIn(USDC) -> sushiOutJPYC(JPYC) -> quickOutUsdc(USDC)で裁定機会を探る
  // USDC -> SUSHISWAP -> JPYC
  const sushiOutJpyc = getAmount(
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    amountIn
  );

  // JPYC -> QUICKSWAP -> USDC
  const quickOutUsdc = getAmount(
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    sushiOutJpyc
  );

  return {
    "QUICK/SUSHI": sushiOutUsdc - amountIn,
    "SUSHI/QUICK": quickOutUsdc - amountIn,
  };
};

exports.strToFloat = strToFloat;
exports.rateDiff = rateDiff;
exports.rate = rate;
exports.estimateProfit = estimateProfit;

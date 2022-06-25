const fs = require("fs");

const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const amountInJpyc = 1300; // 取引量
const amountInUsdc = 10; // 取引量

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
 * @returns - 取引レート
 */
const getRate = (reserveIn, reserveOut, amountIn, margin = 0.3) => {
  const amountInWithFee = amountIn * (100 - margin);
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 100 + amountInWithFee;
  const amountOut = numerator / denominator;
  return amountOut;
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
  const quickOutUsdc = getRate(
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    amountInJpyc
  );
  // amountInUsdc売って、買えるquickOutJpyc
  const quickOutJpyc = getRate(
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    amountInUsdc
  );
  // amountInJpyc売って、買えるquickOutUsdc
  const sushiOutUsdc = getRate(
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    amountInJpyc
  );
  // amountInUsdc売って、買えるquickOutJpyc
  const sushiOutJpyc = getRate(
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    amountInUsdc
  );

  return {
    QUICKSWAP: {
      sell: amountInJpyc / quickOutUsdc,
      buy: quickOutJpyc / amountInUsdc,
    },
    SUSHISWAP: {
      sell: amountInJpyc / sushiOutUsdc,
      buy: sushiOutJpyc / amountInUsdc,
    },
  };
};

exports.rate = rate;

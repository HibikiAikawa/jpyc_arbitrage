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
  const alignedAmount = amount.substring(0, amount.length - (decimals - minimum));
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
 * JPYCを売るときのレートを計算する
 * @param {ethers.ethers.BigNumber} jpycReserves - プールのJPYC量
 * @param {ethers.ethers.BigNumber} usdcReserves - プールのUSDC量
 * @returns - 売りレート
 */
const sellJPYC = (jpycReserves, usdcReserves) =>
  getRate(
    strToFloat(address.TOKEN.JPYC.Decimals, jpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, usdcReserves.toString()),
    amountInJpyc
  );

/**
 * JPYCを買うときのレートを計算する
 * @param {ethers.ethers.BigNumber} jpycReserves - プールのJPYC量
 * @param {ethers.ethers.BigNumber} usdcReserves - プールのUSDC量
 * @returns - 買いレート
 */
const buyJPYC = (jpycReserves, usdcReserves) =>
  getRate(
    strToFloat(address.TOKEN.USDC.Decimals, usdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, jpycReserves.toString()),
    amountInUsdc
  );

/**
 * GET /rateのレスポンス
 * @param {ethers.ethers.BigNumber} jpycReserves - プールのJPYC量
 * @param {ethers.ethers.BigNumber} usdcReserves - プールのUSDC量
 * @returns - オブジェクト
 */
const rate = (jpycReserves, usdcReserves) => {
  const sell = sellJPYC(jpycReserves, usdcReserves);
  const buy = buyJPYC(jpycReserves, usdcReserves);
  return {
    QUICKSWAP: {
      sell: amountInJpyc / sell,
      buy: buy / amountInUsdc,
    },
    SUSHISWAP: {
      sell: 0,
      buy: 0,
    },
  };
};

exports.rate = rate;

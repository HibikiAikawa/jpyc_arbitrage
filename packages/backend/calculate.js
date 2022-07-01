const fs = require("fs");

const arbFunc = require("./arbHandler");

const address = JSON.parse(fs.readFileSync("./address.json", "utf8"));
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

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
    config.amountInJpyc
  );
  // amountInUsdc売って、買えるquickOutJpyc
  const quickOutJpyc = getRate(
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    config.amountInUsdc
  );
  // amountInJpyc売って、買えるsushiOutUsdc
  const sushiOutUsdc = getRate(
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    config.amountInJpyc
  );
  // amountInUsdc売って、買えるsushikOutJpyc
  const sushiOutJpyc = getRate(
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
  const quickOutJpyc = getRate(
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    amountIn
  );
  // JPYC -> SUSHISWAP -> USDC
  const sushiOutUsdc = getRate(
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    quickOutJpyc
  );

  // amountIn(USDC) -> sushiOutJPYC(JPYC) -> quickOutUsdc(USDC)で裁定機会を探る
  // USDC -> SUSHISWAP -> JPYC
  const sushiOutJpyc = getRate(
    strToFloat(address.TOKEN.USDC.Decimals, sushiUsdcReserves.toString()),
    strToFloat(address.TOKEN.JPYC.Decimals, sushiJpycReserves.toString()),
    amountIn
  );

  // JPYC -> QUICKSWAP -> USDC
  const quickOutUsdc = getRate(
    strToFloat(address.TOKEN.JPYC.Decimals, quickJpycReserves.toString()),
    strToFloat(address.TOKEN.USDC.Decimals, quickUsdcReserves.toString()),
    sushiOutJpyc
  );

  return {
    "QUICK/SUSHI": sushiOutUsdc - amountIn,
    "SUSHI/QUICK": quickOutUsdc - amountIn,
  };
};

/**
 * 現在の指定したトークン量を調べる。量はwei建てでなくether建て
 * @param {int} decimals - トークンのDecimals
 * @param {string} tokenAddress - トークンアドレス
 * @returns  ether建でのトークン量
 */
const getBalance = async (decimals, tokenAddress) => {
  const quantity = await arbFunc.getBalance(tokenAddress);
  const balance = strToFloat(decimals, quantity.toString());
  if (isNaN(balance)) {
    return 0.0;
  }
  return balance;
};

exports.getBalance = getBalance;
exports.strToFloat = strToFloat;
exports.rateDiff = rateDiff;
exports.rate = rate;

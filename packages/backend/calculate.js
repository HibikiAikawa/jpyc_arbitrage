/**
 * BigNumberをfloat型に計算しなおす
 * @param {int} decimals - トークンに設定されているdecimals
 * @param {string} amount - BigNumberのstring型
 * @param {int} minimum - 計算する小数の桁数
 * @returns 
 */
 const strToFloat = (decimals, amount, minimum=5) => {
    const _amount = amount.substr(0, amount.length-(decimals-minimum));
    const floatAmount = parseFloat(_amount) / 10**(minimum);
    return floatAmount;
}

/**
 * プールのトークン量と取引するトークン量からレートを計算する
 * @param {int} reserveIn - 預けるトークンのステーク量
 * @param {float} reserveOut - 受け取るトークンのステーク量
 * @param {float} amountIn -  トークンの交換量
 * @param {float} margin - DEXに設定されている手数料
 * @returns - 取引レート
 */

const getRate = (reserveIn, reserveOut, amountIn, margin=0.3) => { 
    const amountInWithFee = amountIn*(100-margin);
    const numerator = amountInWithFee*reserveOut;
    const denominator = reserveIn*100 + amountInWithFee;
    const amountOut = numerator / denominator;
    return amountOut;
}

exports.strToFloat = strToFloat;
exports.getRate = getRate; 
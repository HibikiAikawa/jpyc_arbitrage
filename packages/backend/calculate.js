const token1 = 130000000;
const token2 = 1000000;
const amountIn = 100;

const getRate = (reserveIn, reserveOut, amountIn, margin=0.3) => { 
    const amountInWithFee = amountIn*(100-margin);
    const numerator = amountInWithFee*reserveOut;
    const denominator = reserveIn*100 + amountInWithFee;
    const amountOut = numerator / denominator;
    return amountOut;
}

const tmp = getRate(token1, token2, amountIn);
console.log(tmp);
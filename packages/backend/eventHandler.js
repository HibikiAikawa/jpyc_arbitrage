const calc =  (reserves) => {
    reserves[0]++
    reserves[1]++
}
// emitされたイベントに反応する
const onMint = (senderAddress, amount0, amount1) => {
    console.log("senderAddress: ", senderAddress);
    console.log("amount0: ", amount0);
    console.log("amount1: ", amount1);
};

const onBurn = (senderAddress, amount0, amount1, to) => {
    console.log("senderAddress: ", senderAddress);
    console.log("amount0: ", amount0);
    console.log("amount1: ", amount1);
    console.log("to: ", to);
};

const onSwap = (senderAddress, amount0In, amount1In, amount0Out, amount1Out, to) => {
    console.log("senderAddress: ", senderAddress);
    console.log("amount0In: ", amount0In, ", amount1In: ", amount1In);
    console.log("amount0Out: ", amount0Out, ", amount1Out: ", amount1Out);
    console.log("to: ", to);
    calc(reserves)
    console.log("event: ", reserves);
};

const on = (pairContract, reserves) => {
    pairContract.on("Mint", onMint);
    pairContract.on("Burn", onBurn);
    pairContract.on("Swap", onSwap);
}

exports.on = on;
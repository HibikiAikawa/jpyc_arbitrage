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

const onSwap = (
  senderAddress,
  amount0In,
  amount1In,
  amount0Out,
  amount1Out,
  to
) => {
  console.log("senderAddress: ", senderAddress);
  console.log("amount0In: ", amount0In, ", amount1In: ", amount1In);
  console.log("amount0Out: ", amount0Out, ", amount1Out: ", amount1Out);
  console.log("to: ", to);
};

const on = (pairContract) => {
  console.log("on read");
  pairContract.on("Mint", onMint);
  pairContract.on("Burn", onBurn);
  pairContract.on("Swap", onSwap);
};

exports.on = on;


const printTokenReserves = (tokenReserves) => {
  Object.keys(tokenReserves).forEach((chainKey) => {
    Object.keys(tokenReserves[chainKey]).forEach((dexKey) => {
      Object.keys(tokenReserves[chainKey][dexKey]).forEach((pairKey) => {
        Object.keys(tokenReserves[chainKey][dexKey][pairKey]).forEach((tokenKey) => {
          console.log(`${chainKey}-${dexKey}-${pairKey}-${tokenKey}:`, tokenReserves[chainKey][dexKey][pairKey][tokenKey].toString())
        });
      });
    });
  });
}
/**
exports.Rates = (prevRate, currentRate, dex) => {
  if (prevRate < currentRate)
    console.log(
      "buy rate          | " +
        dex +
        ": " +
        "\u001b[31m" +
        currentRate +
        "\u001b[0m"
    );
  else
    console.log(
      "buy rate          | " +
        dex +
        ": " +
        "\u001b[37m" +
        currentRate +
        "\u001b[0m"
    );
};
*/

exports.printTokenReserves = printTokenReserves;

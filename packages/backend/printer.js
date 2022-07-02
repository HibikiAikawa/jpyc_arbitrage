//
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

const hre = require("hardhat");

const main = async() => {
  const [owner, user] = await hre.ethers.getSigners();

  const Arbitrage = await hre.ethers.getContractFactory("Arbitrage");
  const arbi = await Arbitrage.deploy();

  await arbi.deployed();

  console.log("contract address:", arbi.address);
  console.log("owner address:", owner.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

require("dotenv").config();
const EventEmitter = require("events");
const ethers = require("ethers");
const pairContractAbi =
  require("@uniswap/v2-core/build/IUniswapV2Pair.json").abi;

// TODO infraAPIの取得
const providerMatic = ethers.getDefaultProvider("matic");
const providerAstar = new ethers.providers.JsonRpcProvider(
  "https://astar.api.onfinality.io/rpc?apikey=7310a927-ffd9-4b8d-a2b5-13792e73f464"
);
const signer = new ethers.Wallet(process.env.SEACRET_ADDRESS, providerMatic);

const dexEvent = new EventEmitter();

// emitされたイベントに反応する
const onMint = (chain, dex, pair) => (senderAddress, amount0, amount1) => {
  console.log("eventHandler caught Mint evetnt");
  const variable = {
    chain,
    dex,
    pair,
    event: "mint",
    output: [amount0, amount1],
  };
  dexEvent.emit("Mint", variable);
};

const onBurn = (chain, dex, pair) => (senderAddress, amount0, amount1, to) => {
  console.log("eventHandler caught Burn evetnt");
  const variable = {
    chain,
    dex,
    pair,
    event: "burn",
    output: [amount0, amount1],
  };
  dexEvent.emit("Burn", variable);
};

const onSwap =
  (chain, dex, pair) =>
  (senderAddress, amount0In, amount1In, amount0Out, amount1Out, to) => {
    console.log("from: ", senderAddress, "to: ", to);
    console.log("eventHandler caught Swap evetnt");
    const variable = {
      chain,
      dex,
      pair,
      event: "swap",
      output: [amount0In, amount1In, amount0Out, amount1Out],
    };
    dexEvent.emit("Swap", variable);
  };

/**
 * 一つのプールイベントをリッスンする
 * Swap, Burn, Mintのイベントを受け取る
 * @param {string} pool - プールのコントラクトアドレス
 */
const startPoolEvent = async (chain, dex, pair, poolAddress) => {
  const poolContract = new ethers.Contract(
    poolAddress,
    pairContractAbi,
    signer
  );
  const tokensReserves = await poolContract.getReserves();
  [token0Reserves, token1Reserves] = tokensReserves;
  const variable = { chain, dex, pair, token0Reserves, token1Reserves };
  dexEvent.emit("Update", variable);
  poolContract.on("Swap", onSwap(chain, dex, pair));
  //poolContract.on("Mint", onMint(chain, dex, pair));
  //poolContract.on("Burn", onBurn(chain, dex, pair));

  setInterval(async () => {
    const tokensReserves = await poolContract.getReserves();
    [token0Reserves, token1Reserves] = tokensReserves;
    const variable = { chain, dex, pair, token0Reserves, token1Reserves };
    dexEvent.emit("Update", variable);
  }, 60000); // 5分
};

/**
 * 全てのプールのイベントをリッスンにする
 * @param {Object} addressJson - address.jsonを指す
 */
const startPoolTrack = (addressJson) => {
  const pools = addressJson.POOL;

  // JSONからチェーン・DEX名・PoolのTokenペア・Poolアドレスを抽出する
  Object.keys(pools).forEach((chainKey) => {
    Object.keys(pools[chainKey]).forEach((dexKey) => {
      Object.keys(pools[chainKey][dexKey]).forEach((pairKey) => {
        startPoolEvent(
          chainKey,
          dexKey,
          pairKey,
          pools[chainKey][dexKey][pairKey]
        );
      });
    });
  });
};

const updateReserves = async (pairContract) => {
  // プールのステーク量を取得
  const tokensReserves = await pairContract.getReserves();
  [token0Reserves, token1Reserves] = tokensReserves;
  console.log("(first)");
  console.log("token1 quantity   | ", token0Reserves.toString());
  console.log("token2 quantity   | ", token1Reserves.toString());
  console.log(
    "----------------------------------------------------------------"
  );

  pairContract.on("Swap", onSwap);
  pairContract.on("Mint", onMint);
  pairContract.on("Burn", onBurn);

  setInterval(async () => {
    const tokensReserves = await pairContract.getReserves();
    [token0Reserves, token1Reserves] = tokensReserves;
    console.log("(latest)");
    console.log("token1 quantity   | ", token0Reserves.toString());
    console.log("token2 quantity   | ", token1Reserves.toString());
    console.log(
      "----------------------------------------------------------------"
    );
  }, 60000); // 5分
};

const on = async (pairContract) => {
  await updateReserves(pairContract);
};

exports.on = on;
exports.dexEvent = dexEvent;
exports.startPoolTrack = startPoolTrack;

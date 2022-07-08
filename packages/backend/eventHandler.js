require("dotenv").config();
const EventEmitter = require("events");
const ethers = require("ethers");
const pairContractAbi =
  require("@uniswap/v2-core/build/IUniswapV2Pair.json").abi;

// 各ブロックチェーンのproviderを取得
const providerMatic = ethers.getDefaultProvider("matic");
const providerAstar = new ethers.providers.JsonRpcProvider(
  "https://astar.api.onfinality.io/rpc?apikey=7310a927-ffd9-4b8d-a2b5-13792e73f464"
);

// signerをチェーン毎に設定
const signerMatic = new ethers.Wallet(
  process.env.SEACRET_ADDRESS,
  providerMatic
);
const signerAstar = new ethers.Wallet(
  process.env.SEACRET_ADDRESS,
  providerAstar
);
const signer = { ASTAR: signerAstar, MATIC: signerMatic };

const dexEvent = new EventEmitter();

/**
 * イベント用関数のラッパー
 * ブロックチェーンからの情報に加えてイベント起きたチェーン・DEX・トークンペアの情報を引数に加える
 * @param {string} chain - ブロックチェーン名
 * @param {string} dex - DEX名
 * @param {string} pair - トークンペア名
 * @returns {function} - ラップされたイベント関数。チェーン名やDEX名などの付加情報を引数に含む
 */
const onMint = (chain, dex, pair) => (senderAddress, amount0, amount1) => {
  const event = "mint";
  const args = { senderAddress, amount0, amount1 };
  const variable = {
    chain,
    dex,
    pair,
    event,
    args,
  };
  dexEvent.emit("Mint", variable);
};

const onBurn = (chain, dex, pair) => (senderAddress, amount0, amount1, to) => {
  const event = "burn";
  const args = { senderAddress, amount0, amount1, to };
  const variable = {
    chain,
    dex,
    pair,
    event,
    args,
  };
  dexEvent.emit("Burn", variable);
};

const onSwap =
  (chain, dex, pair) =>
  (senderAddress, amount0In, amount1In, amount0Out, amount1Out, to) => {
    const event = "swap";
    const args = {
      senderAddress,
      amount0In,
      amount1In,
      amount0Out,
      amount1Out,
      to,
    };
    const variable = {
      chain,
      dex,
      pair,
      event,
      args,
    };
    dexEvent.emit("Swap", variable);
  };

/**
 * 一つのプールイベントをリッスンする
 * Swap, Burn, Mintのイベントを受け取る
 * @param {string} chain - ブロックチェーンの名前
 * @param {string} dex - DEXの名前
 * @param {string} pair - トークンペア名
 * @param {string} poolAddress - POOLのコントラクトアドレス
 */
const startPoolEvent = async (chain, dex, pair, poolAddress) => {
  const poolContract = new ethers.Contract(
    poolAddress,
    pairContractAbi,
    signer[chain]
  );

  // 最初にプールにステークされているトークン量を問い合わせる
  let tokensReserves = await poolContract.getReserves();
  let [token0Reserves, token1Reserves] = tokensReserves;
  let event = "init";
  let variable = { chain, dex, pair, event, token0Reserves, token1Reserves };
  dexEvent.emit("Update", variable);

  // イベントをリッスンする
  poolContract.on("Swap", onSwap(chain, dex, pair));
  poolContract.on("Mint", onMint(chain, dex, pair));
  poolContract.on("Burn", onBurn(chain, dex, pair));

  setInterval(async () => {
    event = "update";
    tokensReserves = await poolContract.getReserves();
    [token0Reserves, token1Reserves] = tokensReserves;
    variable = {
      chain,
      dex,
      pair,
      event,
      token0Reserves,
      token1Reserves,
    };
    dexEvent.emit("Update", variable);
  }, 300000); // 5分
};

/**
 * 全てのプールのイベントをリッスンにする
 * @param {Object} addressJson - address.json
 */
const startPoolTrack = (addressJson) => {
  const pools = addressJson.POOL;

  // JSONからチェーン・DEX名・PoolのTokenペア・Poolアドレスを抽出
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

exports.dexEvent = dexEvent;
exports.startPoolTrack = startPoolTrack;

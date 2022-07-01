import React from "react";
import { PanelSwapPrice, PanelSwapRate, TradingChart } from "components";
import Layout from "./Layout";
import ProfitContents from "./ProfitContents";

/**
 *
 * @param {*} props
 * @returns
 */
const Home = (props) => {
  return (
    <Layout
      className="bg-slate-100 p-5 display: blockcontainer mx-auto gap-4 pb-0"
      contentClassName="p-4 grid grid-cols-3 gap-4"
    >
      <PanelSwapPrice
        className="bg-white border-2 rounded-lg bg-clip-border border-indigo-500/10"
        label="QUICKSWAP"
      />
      <PanelSwapPrice
        className="bg-white border-2 rounded-lg bg-clip-border border-indigo-500/10"
        label="SUSHISWAP"
      />
      <PanelSwapRate
        className="bg-white border-2 rounded-lg bg-clip-border border-indigo-500/10"
        label="Swap Rate"
      />

      <ProfitContents
        className="col-span-3 grid grid-cols-3 gap-4"
        historyClassName="bg-white col-span-1 border-2 rounded-lg bg-clip-border border-indigo-500/10"
        chartClassName="bg-white col-span-2 border-2 rounded-lg bg-clip-border border-indigo-500/10"
      />

      <div className="bg-white col-span-3 border-2 rounded-lg bg-clip-border border-indigo-500/10 p-4">
        <TradingChart />
      </div>
    </Layout>
  );
};

export default Home;

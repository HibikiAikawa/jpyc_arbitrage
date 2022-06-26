import React, { useEffect, useRef } from "react";
import { useHistory } from "hooks";
import {
  LineChart,
  PanelSwapPrice,
  PanelSwapRate,
  PanelTradeHistory,
} from "components";
import Layout from "./Layout";

/**
 *
 * @param {*} props
 * @returns
 */
const Home = (props) => {
  const [data] = useHistory();


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

      <PanelTradeHistory className="bg-white col-span-1 border-2 rounded-lg bg-clip-border border-indigo-500/10" />
      <LineChart
        className="bg-white col-span-2 border-2 rounded-lg bg-clip-border border-indigo-500/10"
        data={data}
      />

    </Layout>
  );
};

export default Home;

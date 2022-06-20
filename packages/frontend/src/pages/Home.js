import React, { useEffect, useRef } from "react";
//
import { useHistory } from "hooks";
import { LineChart, PricePanel } from "components";
import Layout from "./Layout";

/**
 *
 * @param {*} props
 * @returns
 */
const Home = (props) => {
  const [data] = useHistory();

  return (
    <Layout>
      <div className="container">
        <div className="row">
          <div className="column col-lg-3">
            <PricePanel label="QUICKSWAP" />
          </div>
          <div className="column col-lg-3">
            <PricePanel label="SUSHISWAP" />
          </div>
          <div className="column col-lg-3">
            <h2>SWAP RATE</h2>
          </div>
        </div>
        <div className="row">
          <div className="column col-lg-3">
            <h2>取引履歴</h2>
          </div>
          <div className="column col-lg-6">
            <h2>損益グラフ</h2>
            <LineChart data={data} datasets={data} />
          </div>
        </div>
        <div className="row">
          <div className="column col-lg-9">
            <h2>チャート</h2>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

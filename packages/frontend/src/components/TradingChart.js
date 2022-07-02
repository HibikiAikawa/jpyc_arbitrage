import React, { useEffect, useRef, useState  } from "react";
import TradingViewWidget, { Themes } from "react-tradingview-widget";

  const TradingChart = () => {
    const tradingRef = useRef(null);
    const [symbol, setSymbol] = useState("SUSHISWAPPOLYGON:JPYCUSDC");

    useEffect(() => {
      console.log(tradingRef.current.props.symbol);
    }, []);

    console.log(symbol);
    return (
      <div>
      <h2 className="text-lg">Chart</h2>
        <p className="chart-note p-4 ">How to add another chart : ①Click "⊕compare"    ②Search "QUICKSWAP:JPYCUSDC"</p>
      <TradingViewWidget
        symbol={symbol}
        theme={Themes.LIGHT}
        interval="1"
        style="2"
        timezone= "Asia/Tokyo"
        locale="en"
        width="100%"
        height="400px"
        inputs={["QUICKSWAP:JPYCUSDC"]}
        ref={tradingRef}
      />
      </div>
    );
  };

  export default TradingChart;

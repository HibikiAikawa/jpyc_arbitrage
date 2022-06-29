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

{/*}
        <div className="bg-slate-100 p-9 pt-0 display: blockcontainer mx-auto gap-4">
        <div className="bg-white col-span-3 border-2 rounded-lg bg-clip-border border-indigo-500/10">
          <h2 className="p-2">チャート</h2>
          <p className="chart-note pl-10">★ Click "⊕compare" -> Search "QUICKSWAP:JPYCUSDC"</p>
          <div className="pl-10 pr-10 pb-8"><TradingChart/></div>
        </div>
      </div>
*/}

          {/*<!-- TradingView Widget BEGIN -->
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js" async>
  
  symbol= "QUICKSWAP:JPYCUSDC",
  width="350px",
  colorTheme= "light",
  isTransparent= false,
  locale= "ja"

  </script>
</div>
<!-- TradingView Widget END -->*/}
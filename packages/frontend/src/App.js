import logo from "./logo.svg";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.css";
import React, { useEffect, useRef, useState  } from "react";
import { Home } from "pages";
import TradingViewWidget, { Themes } from "react-tradingview-widget";


function App() {

  const TradingChart = () => {
    const tradingRef = useRef(null);
    const [symbol, setSymbol] = useState("SUSHISWAPPOLYGON:JPYCUSDC");

    useEffect(() => {
      console.log(tradingRef.current.props.symbol);
    }, []);

    console.log(symbol);
    return (
      <TradingViewWidget
        symbol={[symbol]}
        theme={Themes.LIGHT}
        interval="1"
        style="2"
        timezone= "Asia/Tokyo"
        locale="en"
        width="100%"
        height="400px"
        ref={tradingRef}
      />
    );
  };

  return (
    <div className="App">
      <header className="App-header max-w-5xl">
        <Home />
        <div className="bg-slate-100 p-9 pt-0 display: blockcontainer mx-auto gap-4">
          <div className="bg-white col-span-3 border-2 rounded-lg bg-clip-border border-indigo-500/10">
            <h2 className="p-2">チャート</h2>
            <div className="pl-10 pr-10 pb-8"><TradingChart/></div>
            
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;

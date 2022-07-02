import React,{useState,useEffect} from "react";
import {server,port} from "define";
import axios from "axios";

/**
 *
 * @param {*} props
 * @returns
 */



const PricePanel = ({
  id = "",
  className = "",
  label = "xyz swap",
  price = "",
  liquidity = 0,

}) => {

  const [posts, setProfit] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timerId = setInterval(async () =>{
      try{
      let _res = await axios.get(`http://${server}:${port}/rate`);
      setError(false);
      setProfit(_res.data);
    } catch (error) {
      setError(true);
      setProfit(null);
    }

    setLoading(false)
  } , 5000);
      return () => clearInterval(timerId);
  }, []);

  if (loading === true){
    price="loading..."
    liquidity = "loading..."
  }else if(error === true){
    price="error"
    liquidity = "loading..."
  }else{
    if (label === "QUICKSWAP"){
      price= Math.round(posts.body.QUICKSWAP.sell * 100)/100
      liquidity = Math.round(posts.body.QUICKSWAP.liquidity * 100)/100
    }else{
      price= Math.round(posts.body.SUSHISWAP.sell * 100)/100
      liquidity = Math.round(posts.body.SUSHISWAP.liquidity * 100)/100
    }
  }

  console.log(posts)
  return (
    <div id={id} className={`p-3 ${className}`}>
      <div className="mb-0">
        <p className="text-lg">{label}</p>
      </div>
      <div className="mb-1">
        <p className="text-base">price</p>
        <p className="text-2xl">{price}</p>
      </div>
      <div className="mb-0">
        <p className="text-base">liquidity</p>
        <p className="text-2xl">
          <i className="fa-solid fa-dollar-sign"></i>
          {liquidity}
        </p>
      </div>
    </div>
  );
};

export default PricePanel;

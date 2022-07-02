import React ,{useState,useEffect} from "react"
import {server,port} from "define";
import axios from "axios";

/**
 *
 * @param {*} props
 * @returns
 */
const PricePanel = ({
  className = "",
  label = "xyz swap",
  QUICKtoSUSHI = "",
  SUSHItoQUICK = ""
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
    QUICKtoSUSHI = "loading..."
    SUSHItoQUICK = "loading..."
  }else if(error === true){
    QUICKtoSUSHI = "error"
    SUSHItoQUICK = "error"
  }else{
    QUICKtoSUSHI =  Math.round((posts.body.QUICKSWAP.buy - posts.body.SUSHISWAP.sell) * 100)/100
    SUSHItoQUICK =  Math.round((posts.body.SUSHISWAP.buy - posts.body.QUICKSWAP.sell) * 100)/100
  }

  return (
    <div className={`p-3 ${className}`}>
      <p className="text-xl">{label}</p>
      <div className="m-0">
        <p className="text-base">QUICKSWAP ＝＞ SUSHISWAP</p>
        <p className="text-2xl">{QUICKtoSUSHI}</p>
      </div>
      <div className="m-0">
        <p className="text-base">SUSHISWAP ＝＞ QUICKSWAP</p>
        <p className="text-2xl">{SUSHItoQUICK}</p>
      </div>
    </div>
  );
};

export default PricePanel;

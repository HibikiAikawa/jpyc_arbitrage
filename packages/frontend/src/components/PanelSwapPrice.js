import React,{useState,useEffect} from "react";
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
  liquitity = 0,

}) => {

  
  const [posts, setPosts] = useState(null)

  useEffect(() => {
    const timerId = setInterval(() =>{
      axios.get('http://localhost:3002/rate')
    .then(res => {
        setPosts(res)
    }).catch(e=>{})} , 5000)
      return () => clearInterval(timerId)
  }, [])


  return (
    <div id={id} className={`p-2 ${className}`}>
      <div className="">
        <p className="text-lg">{label}</p>
      </div>
      <div className="m-2">
        <p className="text-base">price</p>
        <p className="text-2xl">{posts?.QUICKSWAP?.sell}</p>
      </div>
      <div className="m-2">
        <p className="text-base">Liquitity</p>
        <p className="text-2xl">
          <i class="fa-solid fa-dollar-sign"></i>
          {liquitity}
        </p>
      </div>
    </div>
  );
};

export default PricePanel;

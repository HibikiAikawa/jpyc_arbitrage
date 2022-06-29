import React from "react";

/**
 *
 * @param {*} props
 * @returns
 */
const PricePanel = ({
  id = "",
  className = "",
  label = "xyz swap",
  price = "〇〇〇 USDC/JPYC",
  liquitity = 0,
}) => {
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
        <p className="text-base">Liquitity</p>
        <p className="text-2xl">
          <i className="fa-solid fa-dollar-sign"></i>
          {liquitity}
        </p>
      </div>
    </div>
  );
};

export default PricePanel;

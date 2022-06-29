import React from "react";

/**
 *
 * @param {*} props
 * @returns
 */
const PricePanel = ({
  className = "",
  label = "xyz swap",
  price = "",
  liquitity = "",
}) => {
  return (
    <div className={`p-3 ${className}`}>
      <p className="text-xl">{label}</p>
      <div className="m-0">
        <p className="text-base">price</p>
        <p className="text-2xl">{price}</p>
      </div>
      <div className="m-0">
        <p className="text-base">Liquitity</p>
        <p className="text-2xl">{liquitity}</p>
      </div>
    </div>
  );
};

export default PricePanel;

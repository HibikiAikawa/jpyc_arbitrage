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
  price = "",
  liquitity = 0,
}) => {
  return (
    <div id={id} className={`p-2 ${className}`}>
      <div className="">
        <p className="text-lg">{label}</p>
      </div>
      <div className="m-2">
        <p className="text-base">price</p>
        <p className="text-2xl">{price}</p>
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

import React from "react";

const example = [
  {
    //
    amount: 1,
    date: Date.now(),
    result: 1,
    unit: "usdc",
  },
  {
    amount: 1,
    date: Date.now(),
    result: 0.000001,
    unit: "usdc",
  },
];

//
const formatDate = (date) => {
  let _data = new Date(date);
  return (
    _data.getFullYear() + "-" + _data.getDate() + "-" + _data.getMonth() + " "
  );
};

//
const ListItem = (props) => {
  const value = props.value;
  return (
    // Wrong! There is no need to specify the key here:
    <li className="p-3">
      <div className="grid grid-cols-8 grid-rows-2 grid-flow-col">
        <div className="col-span-1 row-span-2">
          <div className="bg-green-100 rounded-full text-center">
            <i className="text-green-500 rotate-45 fa-solid fa-arrow-left"></i>
          </div>
        </div>
        <div className="col-span-3 row-span-2">
          <p className="">Amount: {value.amount}</p>
          <p className="text-sm">{formatDate(value.date)}</p>
        </div>
        <div className="col-span-4 row-span-2">
          <p className="text-center inline-block align-middle">
            {value.result >= 0 ? "+" : "-"}
            {value.result}
            {value.unit}
          </p>
        </div>
      </div>
      <hr />
    </li>
  );
};

/**
 *
 * @param {*} props
 * @returns
 */
const PanelTradeHistory = ({
  className = "",
  label = "取引履歴",
  data = example,
}) => {
  //
  return (
    <div className={`p-2 ${className}`}>
      <p className="text-xl">{label}</p>
      <ul>
        {example.map((e, i) => (
          <ListItem key={i.toString()} value={e} />
        ))}
      </ul>
    </div>
  );
};

export default PanelTradeHistory;

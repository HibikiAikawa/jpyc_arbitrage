import React from "react";
import { PanelTradeHistory, LineChart } from "components";
import { useHistory } from "hooks";

/**
 *
 * @param {*} props
 * @returns
 */
const ProfitContents = (props) => {
  const [{ profit, result, loading, error }] = useHistory();

  return (
    <div className={props.className}>
      <PanelTradeHistory className={props.historyClassName} data={result} />

      <LineChart className={props.chartClassName} data={profit} />
    </div>
  );
};

export default ProfitContents;

import React from "react";
import { LineChart } from "components";
import { useHistory } from "hooks";

/**
 *
 * @param {*} props
 * @returns
 */
const LineChatProfit = (props) => {
  //
  const [{ profit, loading, error }] = useHistory();

  return (
    <>
      {error ? (
        <div className={props.className}>
          <p className="text-center">エラー</p>
        </div>
      ) : null}

      {loading ? (
        <div className={props.className}>
          <p className="text-center">読み込み中</p>
        </div>
      ) : null}

      {profit ? <LineChart className={props.className} data={profit} /> : null}
    </>
  );
};

export default LineChatProfit;

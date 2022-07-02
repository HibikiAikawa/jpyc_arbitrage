import { useState, useEffect } from "react";
import { server, port } from "define";
import axios from "axios";

const useHistory = () => {
  //
  const [profit, setProfit] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //
  useEffect(() => {
    const _timer = setInterval(async () => {
      try {
        {
          let _fetch = await axios.get(`http://${server}:${port}/profit`);
          setProfit(_fetch.data);
        }
        {
          let _fetch = await axios.get(`http://${server}:${port}/result/5`);
          setResult(_fetch.data);
        }
        setError(false);
      } catch (error) {
        setError(true);
        setProfit(null);
      }
      setLoading(false);
    }, 5000);
    return () => clearInterval(_timer);
  }, []);

  return [{ profit, result, loading, error }];
};

export default useHistory;

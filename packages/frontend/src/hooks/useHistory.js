import { useState, useEffect } from "react";
import { server, port } from "define";
import axios from "axios";

const useHistory = () => {
  //
  const [profit, setProfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //
  useEffect(() => {
    const _timer = setInterval(async () => {
      try {
        console.debug(`fetch data http://${server}:${port}/profit`);
        let data = await axios.get(`http://${server}:${port}/profit`);
        setError(false);
        setProfit(data);
      } catch (error) {
        setError(true);
        setProfit(null);
      }
      setLoading(false);
    }, 5000);
    return () => clearInterval(_timer);
  }, []);

  return [{ profit, loading, error }];
};

export default useHistory;

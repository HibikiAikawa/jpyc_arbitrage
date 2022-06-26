import React, { useEffect } from "react";
import axios from "axios";

const usePolygonscan = () => {
  useEffect(() => {
    const f = async () => {
      const polygonAPI = "https://api.polygonscan.com/api";
      const contractAddress = "0xcf23f354f1d03ea23db361555cdc6681b69a0f52";
      const address = "0xb7926e83b152bab927335d0c7dff0b65695ae613";
      const yourApiKeyToken = "CGMZU81266TAHN2AN2HX49XQ1PWQ8AB5P3";

      // Get ERC-20 Token TotalSupply by ContractAddress

      // Get a list of 'ERC-20 Token Transfer Events' by Address
      // const URL = `${polygonAPI}?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=asc&apikey=${yourApiKeyToken}`;

      // Get a list of 'Normal' Transactions By Address
      const URL = `${polygonAPI}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${yourApiKeyToken}`;

      // Get a list of 'Internal' Transactions by Address
      //   const URL = `https://api.polygonscan.com/api?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${yourApiKeyToken}`;

      // async await
      let res = await axios.get(URL);
      if (res.data.sataus != "1") return;
      let retvals = res.data.result;
      retvals.filter((val) => {
        return val.blockNumber === 29793447;
      });
    };
    f();
  }, []);

  return [];
};

export default usePolygonscan;

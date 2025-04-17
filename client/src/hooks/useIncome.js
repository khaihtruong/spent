import { useState, useEffect } from "react";
import { fetchGetWithAuth } from "../security/fetchWithAuth";

export default function useIncome() {
  const [incomeItems, setIncomeItems] = useState([]);

  useEffect(() => {
    async function getIncomeFromApi() {
      const income = await fetchGetWithAuth(
        `${process.env.REACT_APP_API_URL}/income`
      );
      setIncomeItems(income);
    }
    getIncomeFromApi();
  }, []);

  return [incomeItems, setIncomeItems];
}

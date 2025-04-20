import { useAuthUser } from "../security/AuthContext";
import { useEffect, useState } from "react";
import { fetchGetWithAuth } from "../security/fetchWithAuth";
import  "../style/profile.css";

export default function Profile() {
  const { user } = useAuthUser();
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/budget`
        );
        const incomes = data.incomes || [];
        const expenses = data.expenses || [];

        const totalEarned = incomes.reduce((acc, cur) => acc + cur.amount, 0);
        const totalSpent = expenses.reduce((acc, cur) => acc + cur.amount, 0);

        setTotalIncome(totalEarned);
        setTotalExpense(totalSpent);
        setBalance(totalEarned - totalSpent);
      } catch (err) {
        console.error("Failed to load budget data:", err);
        setBalance(0);
        setTotalIncome(0);
        setTotalExpense(0);
      }
    }

    loadData();
  }, []);

  return (
    <div className = "profile-page">
      <div className = "profile-header">
        <h2>Profile</h2>
      </div>
      <div className = "profile-info">
        <p>Name: {user?.name}</p>
        <p>📧 Email: {user?.email}</p>
        <p className = "income">🟢 Income: ${totalIncome.toFixed(2)}</p>
        <p className = "expense">🔴 Expense: ${totalExpense.toFixed(2)}</p>
        <p className = "balance">💰 Current Balance: ${balance.toFixed(2)}</p>
      </div>
    </div>
  );
}

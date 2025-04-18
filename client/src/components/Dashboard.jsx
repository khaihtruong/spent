import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchGetWithAuth } from "../security/fetchWithAuth";

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function loadChartData() {
      try {
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/budget`
        );

        const merged = [
          ...data.incomes.map((item) => ({
            ...item,
            type: "income",
          })),
          ...data.expenses.map((item) => ({
            ...item,
            type: "expense",
          })),
        ]
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((item) => ({
            date: new Date(item.createdAt).toLocaleDateString(),
            income: item.type === "income" ? item.amount : 0,
            expense: item.type === "expense" ? item.amount : 0,
          }));

        setChartData(merged);
      } catch (err) {
        console.error("Failed to load chart data:", err);
        alert("Failed to load chart data.");
      }
    }
    loadChartData();
  }, []);

  return (
    <div className="chart__page" style={{ padding: 30 }}>
      <h2>Income & Expense Over Time</h2>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#4CAF50" name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#F44336" name="Expense" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

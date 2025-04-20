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
import "../style/dashboard.css"

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function loadChartData() {
      try {
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/budget`
        );

        const merged = [
          ...data.incomes.map((item) => ({ ...item, type: "income" })),
          ...data.expenses.map((item) => ({ ...item, type: "expense" })),
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
    <div className="chart-page">
      <div className="chart-header">
        <h1>Income & Expense History</h1>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" aspect = {2}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#43aa8b"
              strokeWidth={2}
              name="Income"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef476f"
              strokeWidth={2}
              name="Expense"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
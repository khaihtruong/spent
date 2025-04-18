//import { fetchPostWithAuth, fetchDeleteWithAuth} from "../security/fetchWithAuth";
import { useState, useEffect } from "react";
import "../style/test.css";
import {
  fetchGetWithAuth,
  fetchPostWithAuth,
  fetchDeleteWithAuth,
  fetchPutWithAuth,
} from "../security/fetchWithAuth";

export default function App() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/budget`
        );
        setIncomes(data.incomes || []);
        setExpenses(data.expenses || []);
      } catch (err) {
        console.error("Failed to load budget data:", err);
        alert("Failed to load budget data.");
      }
    }
    loadData();
  }, []);

  const handleAddItem = async (type) => {
    if (!description || !amount) return;

    const newItem = {
      title: description,
      amount: parseFloat(amount),
    };

    const url =
      type === "income"
        ? `${process.env.REACT_APP_API_URL}/income`
        : `${process.env.REACT_APP_API_URL}/expenses`;

    const response = await fetchPostWithAuth(url, newItem);

    if (response.ok) {
      const data = await response.json();
      if (type === "income") {
        setIncomes([...incomes, data]);
      } else {
        setExpenses([...expenses, data]);
      }
      setDescription("");
      setAmount("");
      alert("Item added successfully.");
    } else {
      alert("Failed to add item.");
    }
  };

  const handleDelete = async (type, id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    const url =
      type === "income"
        ? `${process.env.REACT_APP_API_URL}/income/${id}`
        : `${process.env.REACT_APP_API_URL}/expenses/${id}`;

    const response = await fetchDeleteWithAuth(url);

    if (response.ok) {
      if (type === "income") {
        setIncomes(incomes.filter((item) => item.id !== id));
      } else {
        setExpenses(expenses.filter((item) => item.id !== id));
      }
      alert("Item deleted successfully.");
    } else {
      alert("Failed to delete item.");
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setDescription(item.title);
    setAmount(item.amount);
  };

  const handleUpdate = async (type) => {
    if (!editing) return;

    if (editing.type !== type) {
      alert(`You're editing a ${editing.type}. Please click the correct "Update ${editing.type}" button.`);
      return;
    }

    const url = `${process.env.REACT_APP_API_URL}/${editing.type}/${editing.id}`;
    const updatedItem = {
      title: description,
      amount: parseFloat(amount),
    };

    const response = await fetchPutWithAuth(url, updatedItem);

    if (response.ok) {
      const data = await response.json();
      if (editing.type === "income") {
        setIncomes(incomes.map((item) => (item.id === data.id ? data : item)));
      } else {
        setExpenses(expenses.map((item) => (item.id === data.id ? data : item)));
      }
      setDescription("");
      setAmount("");
      setEditing(null);
      alert("Item updated successfully.");
    } else {
      alert("Failed to update item.");
    }
  };

  const totalEarned = incomes.reduce((acc, cur) => acc + cur.amount, 0);
  const totalSpent = expenses.reduce((acc, cur) => acc + cur.amount, 0);
  const available = totalEarned - totalSpent;

  return (
    <div className="container">
      <div className="budget__numbers">
        <div id="earned" className="number">
          <small>Money Earned</small>
          <div className="amount__container">
            <p id="earned__symbol">$</p>
            <span id="amount__earned">{totalEarned.toFixed(2)}</span>
          </div>
        </div>
        <div id="available" className="number">
          <small>Money Available</small>
          <div className="amount__container">
            <p>$</p>
            <span id="amount__available">{available.toFixed(2)}</span>
          </div>
        </div>
        <div id="spent" className="number">
          <small>Money Spent</small>
          <div className="amount__container">
            <p id="spent__symbol">$</p>
            <span id="amount__spent">{totalSpent.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="input__area">
        <input
          type="text"
          id="description"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          id="amount"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="buttons__area">
        <button id="add__income" onClick={() => (editing ? handleUpdate("income") : handleAddItem("income"))}>
            {editing && editing.type === "income" ? "Update Income" : "Add Income"}
            </button>

        <button id="add__expense" onClick={() => (editing ? handleUpdate("expense") : handleAddItem("expense"))}>
          {editing && editing.type === "expense" ? "Update Expense" : "Add Expense"}
        </button>
      </div>

      <div className="items__container">
        <div id="income__container" className="container">
          <h2>Income</h2>
          {incomes.map((item) => (
            <div className="item income" key={item.id} id={`item-${item.id}`}>
              <h4>{item.title}</h4>
              <div className="item__income">
                <p className="symbol">$</p>
                <span className="income__amount">{item.amount?.toFixed(2)}</span>
              </div>
              <button className="delete__btn" onClick={() => handleDelete("income", item.id)}>
                ×
              </button>
              <button className="edit__btn" onClick={() => handleEdit({ ...item, type: "income" })}>
                ✎
              </button>
            </div>
          ))}
        </div>

        <div id="expenses__container" className="container">
          <h2>Expenses</h2>
          {expenses.map((item) => (
            <div className="item expense" key={item.id} id={`item-${item.id}`}>
              <h4>{item.title}</h4>
              <div className="item__expense">
                <p className="symbol">$</p>
                <span className="expense__amount">{item.amount?.toFixed(2)}</span>
              </div>
              <button className="delete__btn" onClick={() => handleDelete("expense", item.id)}>
                ×
              </button>
              <button className="edit__btn" onClick={() => handleEdit({ ...item, type: "expense" })}>
                ✎
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
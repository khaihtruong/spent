import { useState } from "react";
import { fetchPostWithAuth, fetchDeleteWithAuth} from "../security/fetchWithAuth";
import "../style/test.css";

export default function App() {
  const [items, setItems] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddItem = async (type) => {
    if (!description || !amount) return;

    const newItem = {
      description,
      amount: parseFloat(amount),
      type,
    };

    const response = await fetchPostWithAuth(
      `${process.env.REACT_APP_API_URL}/todos`,
      newItem
    );

    if (response.ok) {
      const data = await response.json();
      setItems([...items, data]);
      setDescription("");
      setAmount("");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    const response = await fetchDeleteWithAuth(
      `${process.env.REACT_APP_API_URL}/budget/${id}`
    );

    if (response.ok) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const totalEarned = items
    .filter((item) => item.type === "income")
    .reduce((acc, cur) => acc + cur.amount, 0);

  const totalSpent = items
    .filter((item) => item.type === "expense")
    .reduce((acc, cur) => acc + cur.amount, 0);

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
        <button id="add__income" onClick={() => handleAddItem("income")}>
          Add Income
        </button>
        <button id="add__expense" onClick={() => handleAddItem("expense")}>
          Add Expense
        </button>
      </div>

      <div className="items__container">
        <div id="income__container" className="container">
          <h2>Income</h2>
          {items
            .filter((item) => item.type === "income")
            .map((item) => (
              <div className="item income" key={item.id} id={`item-${item.id}`}>
                <h4>{item.description}</h4>
                <div className="item__income">
                  <p className="symbol">$</p>
                  <span className="income__amount">{item.amount.toFixed(2)}</span>
                </div>
                <i className="far fa-trash-alt" onClick={() => handleDelete(item.id)}></i>
              </div>
            ))}
        </div>

        <div id="expenses__container" className="container">
          <h2>Expenses</h2>
          {items
            .filter((item) => item.type === "expense")
            .map((item) => (
              <div className="item expense" key={item.id} id={`item-${item.id}`}>
                <h4>{item.description}</h4>
                <div className="item__expense">
                  <p className="symbol">$</p>
                  <span className="expense__amount">{item.amount.toFixed(2)}</span>
                </div>
                <i className="far fa-trash-alt" onClick={() => handleDelete(item.id)}></i>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

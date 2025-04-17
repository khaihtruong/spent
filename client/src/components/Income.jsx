import "../style/todoList.css";

import { useState } from "react";
import useIncome from "../hooks/useIncome";
import { fetchPostWithAuth, fetchDeleteWithAuth } from "../security/fetchWithAuth";

export default function Income() {
  const [newItemText, setNewItemText] = useState("");
  const [incomeItems, setIncomeItems] = useIncome();

  async function deleteIncome(id) {
      const res = await fetchDeleteWithAuth(
        `${process.env.REACT_APP_API_URL}/income/${id}`
      );
    
      if (res.ok) {
        const deletedIncome = await res.json();
        return deletedIncome;
      } else {
        return null;
      }
    }
  
    const handleDeleteIncome = async (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this item?");
      if (!confirmDelete) return;
    
      const deleted = await deleteIncome(id);
      if (deleted) {
        setIncomeItems((prevIncome) =>
          prevIncome.filter((item) => item.id !== id)
        );
      }
    };

  async function insertIncome(title) {
    const data = await fetchPostWithAuth(
      `${process.env.REACT_APP_API_URL}/income`,
      {
        title: title,
      }
    );

    if (data.ok) {
      const income = await data.json();
      return income;
    } else {
      return null;
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!newItemText) return;

    const newIncome = await insertIncome(newItemText);
    if (newIncome) {
      setIncomeItems([...incomeItems, newIncome]);
      setNewItemText("");
    }
  };

  return (
    <div className="todo-list">
      <form
        onSubmit={(e) => handleFormSubmit(e)}
        className="todo-form"
        autoComplete="off"
      >
        <div>
          <label htmlFor="item">New Income</label>
          <input
            type="text"
            name="item"
            id="item"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
          />
        </div>
        <button type="submit">+ Add Income</button>
      </form>

      <ul className="list">
        {incomeItems.map((item) => {
          return (
            <li key={item.id} className="todo-item">
              <input
                onChange={(e) => console.log(e.target)}
                value={item.id}
                type="checkbox"
                checked={item.completed}
              />
              <span className="itemName">{item.title}</span>
              <button aria-label={`Remove ${item.title}`} value={item.id} onClick={(e) => {handleDeleteIncome(item.id)}}>
                X
              </button>
            </li>
          );
        })}
      </ul>
    </div>
    
  );
}

import "../style/todoList.css";

import { useState } from "react";
import useTodos from "../hooks/useTodos";
import { fetchPostWithAuth, fetchDeleteWithAuth} from "../security/fetchWithAuth";

export default function Todos() {
  const [newItemText, setNewItemText] = useState("");
  const [todosItems, setTodosItems] = useTodos();

  async function deleteTodo(id) {
    const res = await fetchDeleteWithAuth(
      `${process.env.REACT_APP_API_URL}/todos/${id}`
    );
  
    if (res.ok) {
      const deletedTodo = await res.json();
      return deletedTodo;
    } else {
      return null;
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;
  
    const deleted = await deleteTodo(id);
    if (deleted) {
      setTodosItems((prevTodos) =>
        prevTodos.filter((item) => item.id !== id)
      );
    }
  };

  async function insertTodo(title) {
    const data = await fetchPostWithAuth(
      `${process.env.REACT_APP_API_URL}/todos`,
      {
        title: title,
      }
    );

    if (data.ok) {
      const todo = await data.json();
      return todo;
    } else {
      return null;
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!newItemText) return;

    const newTodo = await insertTodo(newItemText);
    if (newTodo) {
      setTodosItems([...todosItems, newTodo]);
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
          <label htmlFor="item">New Purchase</label>
          <input
            type="text"
            name="item"
            id="item"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
          />
        </div>
        <button type="submit">+ Add Purchase</button>
      </form>

      <ul className="list">
        {todosItems.map((item) => {
          return (
            <li key={item.id} className="todo-item">
              <input
                onChange={(e) => console.log(e.target)}
                value={item.id}
                type="checkbox"
                checked={item.completed}
              />
              <span className="itemName">{item.title}</span>
              <button aria-label={`Remove ${item.title}`} value={item.id} onClick={(e) => {handleDelete(item.id)}}>
                X
              </button>
            </li>
          );
        })}
      </ul>
    </div>
    
  );
}

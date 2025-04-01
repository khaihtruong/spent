import { useState, useEffect } from "react";
import { fetchGetWithAuth } from "../security/fetchWithAuth";

export default function useTodos() {
  const [todosItems, setTodosItems] = useState([]);

  useEffect(() => {
    async function getTodosFromApi() {
      const todos = await fetchGetWithAuth(
        `${process.env.REACT_APP_API_URL}/todos`
      );
      setTodosItems(todos);
    }
    getTodosFromApi();
  }, []);

  return [todosItems, setTodosItems];
}

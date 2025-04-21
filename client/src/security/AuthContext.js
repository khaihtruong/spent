import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUser(data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed, please try again!");
      }

      const userData = await res.json();
      setIsAuthenticated(true);
      setUser(userData);
      setError(null);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const register = async (email, password, name) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Registration failed, please try again!"
        );
      }

      const userData = await res.json();
      setIsAuthenticated(true);
      setUser(userData);
      setError(null);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthUser = () => useContext(AuthContext);

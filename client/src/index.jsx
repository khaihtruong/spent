import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Todos from "./components/Todos";
import Income from "./components/Income"
import TodoDetail from "./components/TodoDetail";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Test from "./components/Test";
import Exchange from "./components/Exchange"
import { AuthProvider } from "./security/AuthContext";
import RequireAuth from "./security/RequireAuth";
import "./style/normalize.css";
import "./style/index.css";

const container = document.getElementById("root");

const root = ReactDOMClient.createRoot(container);

root.render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/app/*"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        > 
          <Route path="profile" element= {<Profile />}/>
          <Route path="todos" element={<><Todos /><Income /></>} />
          <Route path="test" element= {<Test />}/>
          <Route path="exchange" element= {<Exchange />}/>
          <Route path="todos/:todoId" element={<TodoDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  
);

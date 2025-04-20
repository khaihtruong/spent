import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

import "../style/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthUser();

  return (
    <div className="home">
      <div>
        <img src={logo} alt="Logo" className="logo" />
        <h1>Spent</h1>
      </div>
      <div>
        {!isAuthenticated ? (
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Login
          </button>
        ) : (
          <button className="btn-primary" onClick={() => navigate("/app")}>
            Enter App
          </button>
        )}
      </div>
      <div>
        <button className="btn-secondary" onClick={() => navigate("/register")}>
          Create Account
        </button>
      </div>
    </div>
  );
}

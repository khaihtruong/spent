import { useAuthUser } from "../security/AuthContext";
import { useNavigate, Outlet, Link } from "react-router-dom";
import logo from "../assets/logo.png";

import "../style/appLayout.css";

export default function AppLayout() {
  const { logout } = useAuthUser();
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="title">
        {}
        <img src={logo} alt="Logo" className="logo" />
        <h1>Spent</h1>
      </div>
      <div className="header">
        <nav className="menu">
          <ul className="menu-list">
            <li>
              <Link to="/app/dashboard">Home</Link>
            </li>
            <li>
              <Link to="/app/profile">Profile</Link>
            </li>
            <li>
              <Link to="/app/transaction">Transactions</Link>
            </li>
            <li>
              <Link to="/app/exchange">Exchange</Link>
            </li>
          </ul>
        </nav>

        {/* LogOut button all the way to the right */}
        <button
          className="exit-button"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          LogOut
        </button>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

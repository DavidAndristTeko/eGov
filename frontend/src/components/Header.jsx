import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

export default function Header() {
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const token = useStore((s) => s.token);
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header style={{ padding: "1rem", background: "#fff" }}>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/products">Produkte</Link>
        {token ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}

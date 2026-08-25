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
    <header className="bg-white shadow-md border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <Link
            to="/"
            className="font-bold text-lg text-blue-600 hover:text-blue-800 transition"
          >
            eGov
          </Link>
          <Link
            to="/"
            className="text-slate-700 hover:text-blue-600 transition"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-slate-700 hover:text-blue-600 transition"
          >
            Produkte
          </Link>
          <Link
            to="/orders"
            className="text-slate-700 hover:text-blue-600 transition"
          >
            Meine Bestellungen
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {!token && (
            <Link
              to="/register"
              className="px-4 py-2 text-slate-700 hover:text-blue-600 transition"
            >
              Registrieren
            </Link>
          )}
          {token ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

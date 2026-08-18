import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // User eingeloggt?
    return <Navigate to="/login" replace />; // Wenn nicht -> redirect zu login, replace sorgt dafür dass die alte Route nicht in der Browser History bleibt
  }

  return children; // Wenn eingeloggt wird die Seite angezeigt (Z.B. Products.jsx)
}

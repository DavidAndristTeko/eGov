// "Wächter": Datei ist eine Schutzkomponente

import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";
import React from "react";

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // User eingeloggt?, prüft Login Status
    return <Navigate to="/login" replace />; // Zeigt /login an falls nicht eingeloggt, replace sorgt dafür dass die alte Route nicht in der Browser History bleibt
  }

  return children; // zeigt die Seite an falls eingeloggt
}

// Das hier ist der Einstiegspunkt (das erste was der Browser ausführt)
// hier wird alles initaliisert und alle provider eingerichtet, die App wird ins DOM eingefügt

import React from "react"; // react import für JSX
import { createRoot } from "react-dom/client"; // für rendering ins DOM
import { BrowserRouter } from "react-router-dom"; // navigation zwischen Seiten
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Server State management
import App from "./App"; // Haupt App (Wurzelkomponente)
import "./index.css"; // Globale Styles

// erstellt ein neues objekt mit default einstellungen
const queryClient = new QueryClient();

// Hierarchie der Provider
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {" "}
    {/* äusserste Schicht */}
    <QueryClientProvider client={queryClient}>
      {" "}
      {/* 2. schicht */}
      <BrowserRouter>
        {" "}
        {/* 3. schicht */}
        <App /> {/* innerste schicht (die App selbst) */}
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);

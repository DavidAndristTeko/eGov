// Startpunkt der Anwendungs-UI, Aufbau von unserer Seite findet hier statt.

import React from "react";
// React Router um verschiedene Seiten darzustellen -> alles Single Page Application SPA
import { Routes, Route, Link } from "react-router-dom";
// Normale Kompontenten und Seiten import
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
// Lazy Loading: Seite wird erst geladen wenn man sie braucht (Zeit sparend)
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const Orders = React.lazy(() => import("./pages/Orders"));
export default function App() {
  return (
    // Header ist ausserhalb von <Routes> wird somit immer angezeigt
    <div className="app-root">
      <Header />{" "}
      {/*Kein schliessendes Tag nötig, da kurzform (Header hat keinen Inhalt), selbstschliessende JSX-Syntax*/}
      <main>
        <Routes>
          {" "}
          {/*Wegweiser fürs Forntend, Wenn die URL X ist, zeige Komponente Y*/}
          <Route path="/" element={<Home />} />{" "}
          {/*Home: selbstschliessendes Tag, JSX-Syntax*/}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                {" "}
                {/*ProtectedRoute: Nur wenn User eingeloggt ist, sonst routing zu login*/}
                <Products /> {/*Products: selbstschliessendes Tag, JSX-Syntax*/}
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <React.Suspense fallback={<div>Lädt...</div>}>
                  {" "}
                  {/* Wartebildschirm wenn lazy Komponenten nachgeladen werden */}
                  <ProductDetails />{" "}
                  {/* ProductDetails: selbstschliessendes Tag, JSX-Syntax*/}
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />{" "}
          {/* Login: selbstschliessendes Tag, JSX-Syntax*/}
          <Route path="/register" element={<Register />} />{" "}
          {/*Register: selbstschliessendes Tag, JSX-Syntax*/}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <React.Suspense fallback={<div>Lädt...</div>}>
                  <Orders /> {/* Orders: selbstschliessendes Tag, JSX-Syntax*/}
                </React.Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

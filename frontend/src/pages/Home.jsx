import React from "react";
import { Link } from "react-router-dom";
import useStore from "../store/useStore";

export default function Home() {
  const user = useStore((state) => state.user);

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mb-12">
        <h1 className="text-5xl font-bold mb-4">Willkommen bei eGov</h1>
        <p className="text-xl text-blue-100 mb-8">
          Eine moderne E-Government Lösung für
          Online-Verwaltungsdienstleistungen
        </p>
        <Link
          to="/products"
          className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          Zu den Produkten →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Große Produktauswahl
          </h3>
          <p className="text-slate-600">
            Durchsuchen Sie unseren umfassenden Katalog mit tausenden Produkten
            und Dienstleistungen.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Sichere Authentifikation
          </h3>
          <p className="text-slate-600">
            Ihre Daten sind durch moderne Sicherheitsstandards und
            Verschlüsselung geschützt.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Schnelle Bestellung
          </h3>
          <p className="text-slate-600">
            Bestellen Sie in wenigen Klicks und verfolgen Sie Ihre Bestellungen
            in Echtzeit.
          </p>
        </div>
      </div>

      {!user && (
        <div className="bg-slate-50 rounded-lg p-8 mt-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Bereit zu starten?
          </h2>
          <p className="text-slate-600 mb-6">
            Melden Sie sich an oder registrieren Sie sich, um unsere Services zu
            nutzen.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Registrieren
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

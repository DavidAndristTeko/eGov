import { Link } from "react-router-dom"; // navigation ohne Seite neu zu laden
import useStore from "../store/useStore"; // Zugriff auf globale Daten (User, Token, etc.)
import React from "react";

export default function Home() {
  const user = useStore((state) => state.user); // holt den aktuellen User wenn angmeldet

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-12 border-l-4 border-[#df6747] bg-[#49494d] p-8 text-[#e3e3cd] sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#df6747]">
          Digitale Verwaltung
        </p>
        <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Willkommen bei eGov
        </h1>
        <p className="mb-8 max-w-xl text-lg leading-relaxed text-[#e3e3cd]/80 sm:text-xl">
          Eine moderne E-Government Lösung für
          Online-Verwaltungsdienstleistungen
        </p>
        <Link
          to="/products"
          className="inline-block rounded-sm bg-[#df6747] px-7 py-3 font-semibold text-[#49494d] transition-colors hover:bg-[#e3e3cd]"
        >
          Zu den Produkten →
        </Link>
      </div>

      {!user && (
        <div className="mt-12 border-y border-[#878d92]/50 px-4 py-10 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#49494d]">
            Bereit zu starten?
          </h2>
          <p className="mb-6 text-[#878d92]">
            Melden Sie sich an oder registrieren Sie sich, um unsere Services zu
            nutzen.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="rounded-sm bg-[#b42f32] px-6 py-3 font-semibold text-[#e3e3cd] transition-colors hover:bg-[#8f2528]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-sm border border-[#b42f32] px-6 py-3 font-semibold text-[#b42f32] transition-colors hover:bg-[#b42f32] hover:text-[#e3e3cd]"
            >
              Registrieren
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

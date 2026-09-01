// Zentrale Speicher-Stelle für die Benutzer-Daten

import create from "zustand";
// alternative zu react context, aber einfacher, für globale Zustände. leichter und schneller als Context API
import { persist } from "zustand/middleware";
// middleware, extra funktion für zustand, speichert daten automatisch in localStorage, beim neuladen sind die daten noch da
import { clearToken, setToken } from "../auth/auth";
// funktionen aus auth.js, speichern und löschen von token im localStorage

// Der Store schicht für schicht (wie sandwich)
export const useStore = create(
  // äussere Schicht -> macht es zu einem Hook
  persist(
    // mittlere schicht -> macht es persistent
    (set) => ({
      // Inhalt kommt hier: set => ({...})
      user: null, // noch nicht eingeloggt
      token: null, // kein Token vorhanden
      setUser: (user, token) => {
        // Benutzer speichern
        set({ user, token });
        if (token) setToken(token);
      },
      logout: () => {
        // Benutzer abmelden
        set({ user: null, token: null });
        clearToken();
      },
    }),
    {
      name: "egov-store", // name in localStorage
      getStorage: () => localStorage, // SpeicherOrt
    },
  ),
);

export default useStore;
// useStore nutzt Login.jsx, Register.jsx und AutchContext.jsx

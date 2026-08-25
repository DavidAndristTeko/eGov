import create from "zustand";
import { persist } from "zustand/middleware";
import { clearToken, setToken } from "../auth/auth";

// Global store for authentication. Persisting the session via zustand.
export const useStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => {
        set({ user, token });
        if (token) setToken(token);
      },
      logout: () => {
        set({ user: null, token: null });
        clearToken();
      },
    }),
    {
      name: "egov-store", // name in localStorage
      getStorage: () => localStorage,
    },
  ),
);

export default useStore;

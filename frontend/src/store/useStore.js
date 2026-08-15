import create from "zustand";
import { persist } from "zustand/middleware";
import { clearToken, setToken } from "../auth/auth";

// Global store for auth + cart examples. Persisting user token in localStorage via zustand.
export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],
      setUser: (user, token) => {
        set({ user, token });
        if (token) setToken(token);
      },
      logout: () => {
        set({ user: null, token: null, cart: [] });
        clearToken();
      },
      addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "egov-store", // name in localStorage
      getStorage: () => localStorage,
    },
  ),
);

export default useStore;

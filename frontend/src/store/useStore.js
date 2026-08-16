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
      addToCart: (item) =>
        set((state) => {
          // Prüfe ob Produkt bereits im Warenkorb ist
          const existingItem = state.cart.find(
            (i) => i.productId === item.productId,
          );

          if (existingItem) {
            // Falls ja, erhöhe die Menge um 1
            return {
              cart: state.cart.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: (i.quantity || 1) + 1 }
                  : i,
              ),
            };
          }

          // Falls nein, füge mit Menge 1 hinzu
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "egov-store", // name in localStorage
      getStorage: () => localStorage,
    },
  ),
);

export default useStore;

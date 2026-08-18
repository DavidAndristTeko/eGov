import React, { useState } from "react";
import useStore from "../store/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/apiClient";

export default function Cart() {
  const cart = useStore((s) => s.cart);
  const user = useStore((s) => s.user);
  const clearCart = useStore((s) => s.clearCart);
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = async (orderPayload) => {
    const res = await api.post("/api/orders", orderPayload);
    return res.data;
  };

  const mutation = useMutation(createOrder, {
    onSuccess: () => {
      if (user?.id) queryClient.invalidateQueries(["orders", user.id]);
    },
  });

  // Ändere Menge eines Items
  const setQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    const newCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    );
    useStore.setState({ cart: newCart });
  };

  // Entferne Item aus Warenkorb
  const removeItem = (productId) => {
    const newCart = cart.filter((item) => item.productId !== productId);
    useStore.setState({ cart: newCart });
  };

  // Berechne Gesamtpreis
  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
      0,
    );
  };

  const placeOrders = async () => {
    if (!user) {
      alert("Bitte einloggen");
      return;
    }

    setIsProcessing(true);
    try {
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const quantity = item.quantity || 1;
        for (let q = 0; q < quantity; q++) {
          const payload = {
            orderId: Date.now() + i + q,
            product: item.productId,
            user: user.id,
            orderStatus: 1,
          };
          // eslint-disable-next-line no-await-in-loop
          await mutation.mutateAsync(payload);
        }
      }
      clearCart();
      alert("Bestellungen erfolgreich erstellt");
    } catch (err) {
      alert("Fehler beim Erstellen der Bestellung");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Warenkorb</h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-6 text-center">
          <p className="text-lg">Ihr Warenkorb ist leer</p>
          <a
            href="/products"
            className="text-blue-600 hover:text-blue-800 font-medium mt-3 inline-block"
          >
            ← Zurück zu Produkten
          </a>
        </div>
      </section>
    );
  }

  const total = calculateTotal();

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Warenkorb</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Produkt
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                  Preis
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                  Menge
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                  Gesamt
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                  Aktion
                </th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr
                  key={item.productId}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {item.productName}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-700">
                    {(item.price || 0).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setQuantity(item.productId, (item.quantity || 1) - 1)
                        }
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded transition text-sm font-medium"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          setQuantity(
                            item.productId,
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-12 text-center border border-slate-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() =>
                          setQuantity(item.productId, (item.quantity || 1) + 1)
                        }
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded transition text-sm font-medium"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-900 font-semibold">
                    {((item.price || 0) * (item.quantity || 1)).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-600 mb-1">Gesamtpreis:</p>
            <p className="text-3xl font-bold text-slate-900">
              {total.toFixed(2)} €
            </p>
          </div>
          <button
            onClick={placeOrders}
            disabled={isProcessing || mutation.isLoading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing || mutation.isLoading
              ? "Bestellte..."
              : "Bestellung aufgeben"}
          </button>
        </div>
      </div>
    </section>
  );
}

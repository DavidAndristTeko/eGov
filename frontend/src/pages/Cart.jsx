import React from "react";
import useStore from "../store/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/apiClient";

export default function Cart() {
  const cart = useStore((s) => s.cart);
  const user = useStore((s) => s.user);
  const clearCart = useStore((s) => s.clearCart);
  const queryClient = useQueryClient();

  const createOrder = async (orderPayload) => {
    const res = await api.post("/api/orders", orderPayload);
    return res.data;
  };

  const mutation = useMutation(createOrder, {
    onSuccess: () => {
      // Invalidate or refetch orders for this user
      if (user?.id) queryClient.invalidateQueries(["orders", user.id]);
    },
  });

  const placeOrders = async () => {
    if (!user) {
      alert("Bitte einloggen");
      return;
    }

    try {
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const payload = {
          orderId: Date.now() + i,
          product: item.productId,
          user: user.id,
          orderStatus: 1,
        };
        // eslint-disable-next-line no-await-in-loop
        await mutation.mutateAsync(payload);
      }
      clearCart();
      alert("Bestellungen erfolgreich erstellt");
    } catch (err) {
      alert("Fehler beim Erstellen der Bestellung");
    }
  };

  if (!cart || cart.length === 0) return <p>Warenkorb ist leer.</p>;

  return (
    <section>
      <h1>Warenkorb</h1>
      <ul>
        {cart.map((c, i) => (
          <li key={i}>
            {c.productName} — {c.price} €
          </li>
        ))}
      </ul>
      <button onClick={placeOrders} disabled={mutation.isLoading}>
        {mutation.isLoading ? "Bestellt..." : "Bestellung aufgeben"}
      </button>
    </section>
  );
}

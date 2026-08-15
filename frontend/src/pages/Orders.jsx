import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useStore from "../store/useStore";
import api from "../api/apiClient";

async function fetchOrders(userId) {
  const res = await api.get(`/api/users/${userId}/orders`);
  return res.data;
}

export default function Orders() {
  const user = useStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ["orders", user?.id],
    () => fetchOrders(user.id),
    {
      enabled: !!user?.id,
    },
  );

  const mutation = useMutation(
    (orderId) => api.delete(`/api/orders/${orderId}`),
    {
      onMutate: async (orderId) => {
        await queryClient.cancelQueries(["orders", user.id]);
        const previous = queryClient.getQueryData(["orders", user.id]);
        queryClient.setQueryData(["orders", user.id], (old = []) =>
          old.filter((o) => o._id !== orderId),
        );
        return { previous };
      },
      onError: (err, orderId, context) => {
        queryClient.setQueryData(["orders", user.id], context.previous);
        alert("Fehler beim Stornieren der Bestellung.");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["orders", user.id]);
      },
    },
  );

  if (!user) return <p>Bitte zuerst einloggen.</p>;
  if (isLoading) return <p>Lädt Bestellungen...</p>;
  if (error) return <p>Fehler beim Laden der Bestellungen.</p>;

  return (
    <section>
      <h1>Meine Bestellungen</h1>
      {data.length === 0 ? (
        <p>Keine Bestellungen gefunden.</p>
      ) : (
        <ul>
          {data.map((o) => (
            <li key={o._id} style={{ marginBottom: "1rem" }}>
              <div>
                <strong>Bestellnummer:</strong> {o.orderId}
              </div>
              <div>
                <strong>Produkt:</strong> {o.product?.productName || o.product}
              </div>
              <div>
                <strong>Datum:</strong> {new Date(o.orderDate).toLocaleString()}
              </div>
              <div>
                <strong>Status:</strong> {o.orderStatus}
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <button
                  onClick={() => {
                    if (confirm("Bestellung stornieren?")) {
                      mutation.mutate(o._id);
                    }
                  }}
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? "Storniere..." : "Stornieren"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

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
          old.map((o) => (o._id === orderId ? { ...o, orderStatus: 3 } : o)),
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

  if (!user) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-6 text-center">
          <p className="mb-4">
            Bitte melden Sie sich an, um Ihre Bestellungen zu sehen.
          </p>
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Zum Login →
          </a>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Meine Bestellungen</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-200 rounded-lg h-24 animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Meine Bestellungen</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6">
          {error.userMessage || "Fehler beim Laden der Bestellungen."}
          {error.userMessage && (
            <a href="/login" className="block mt-3 font-medium underline">
              Zum Login
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Meine Bestellungen</h1>

      {data.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-6 text-center">
          <p className="mb-4">Sie haben noch keine Bestellungen.</p>
          <a
            href="/products"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Jetzt einkaufen →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Bestellnummer</p>
                  <p className="text-lg font-bold text-slate-900">
                    {o.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className="text-lg font-bold">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {o.orderStatus === 1
                        ? "Ausstehend"
                        : o.orderStatus === 3
                          ? "Inaktiv"
                          : "Verarbeitet"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Produkt</p>
                  <p className="text-slate-900">
                    {o.product?.productName || o.product}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Bestelldatum</p>
                  <p className="text-slate-900">
                    {new Date(o.orderDate).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {o.orderStatus !== 3 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (confirm("Bestellung wirklich stornieren?")) {
                        mutation.mutate(o._id);
                      }
                    }}
                    disabled={mutation.isLoading}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mutation.isLoading ? "Wird storniert..." : "Stornieren"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

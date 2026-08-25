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
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="border border-[#df6747]/40 bg-[#df6747]/10 p-6 text-center text-[#49494d]">
          <p className="mb-4">
            Bitte melden Sie sich an, um Ihre Bestellungen zu sehen.
          </p>
          <a
            href="/login"
            className="font-medium text-[#b42f32] hover:text-[#df6747]"
          >
            Zum Login →
          </a>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-[#49494d]">
          Meine Bestellungen
        </h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-[#878d92]/30"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-[#49494d]">
          Meine Bestellungen
        </h1>
        <div className="border border-[#b42f32]/30 bg-[#b42f32]/10 p-6 text-[#b42f32]">
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
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-[#49494d]">
        Meine Bestellungen
      </h1>

      {data.length === 0 ? (
        <div className="border border-[#df6747]/40 bg-[#df6747]/10 p-6 text-center text-[#49494d]">
          <p className="mb-4">Sie haben noch keine Bestellungen.</p>
          <a
            href="/products"
            className="font-medium text-[#b42f32] hover:text-[#df6747]"
          >
            Jetzt einkaufen →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data.map((o) => (
            <div
              key={o._id}
              className="border-l-4 border-[#b42f32] bg-[#e3e3cd] p-6 shadow-[0_8px_24px_rgba(73,73,77,0.12)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="mb-1 text-sm text-[#878d92]">Bestellnummer</p>
                  <p className="text-lg font-bold text-[#49494d]">
                    {o.orderId}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[#878d92]">Status</p>
                  <p className="text-lg font-bold">
                    <span className="inline-block bg-[#df6747]/20 px-3 py-1 text-sm text-[#b42f32]">
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
                  <p className="mb-1 text-sm text-[#878d92]">Produkt</p>
                  <p className="text-[#49494d]">
                    {o.product?.productName || o.product}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[#878d92]">Bestelldatum</p>
                  <p className="text-[#49494d]">
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

              {o.orderDetails && Object.keys(o.orderDetails).length > 0 && (
                <div className="mb-6 border-t border-[#878d92]/40 pt-4">
                  <p className="mb-2 text-sm text-[#878d92]">
                    Angaben zum Gesuch
                  </p>
                  <dl className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    {Object.entries(o.orderDetails).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-[#878d92]">{key}</dt>
                        <dd className="text-[#49494d]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {o.orderStatus !== 3 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (confirm("Bestellung wirklich stornieren?")) {
                        mutation.mutate(o._id);
                      }
                    }}
                    disabled={mutation.isLoading}
                    className="rounded-sm bg-[#49494d] px-6 py-2 font-medium text-[#e3e3cd] transition-colors hover:bg-[#b42f32] disabled:cursor-not-allowed disabled:opacity-50"
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

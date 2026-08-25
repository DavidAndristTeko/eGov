import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/apiClient";
import useStore from "../store/useStore";

async function fetchProduct(id) {
  const res = await api.get(`/api/products/${id}`);
  return res.data;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery(
    ["product", id],
    () => fetchProduct(id),
    {
      enabled: !!id,
    },
  );
  const user = useStore((s) => s.user);
  const queryClient = useQueryClient();
  const orderMutation = useMutation(
    () =>
      api.post("/api/orders", {
        orderId: Date.now(),
        product: data._id,
        user: user.id,
        orderStatus: 1,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", user?.id]);
        navigate("/orders");
      },
    },
  );

  if (isLoading) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-96 bg-slate-200 rounded-lg mb-6"></div>
          <div className="h-10 bg-slate-200 rounded mb-4 w-2/3"></div>
          <div className="h-6 bg-slate-200 rounded mb-6 w-1/3"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 mb-4">
          Fehler beim Laden des Produkts.
        </div>
        <button
          onClick={() => navigate("/products")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ← Zurück
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <button
        onClick={() => navigate("/products")}
        className="text-blue-600 hover:text-blue-800 font-medium mb-8 inline-flex items-center gap-2"
      >
        ← Zurück zu Produkten
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-64 md:h-96 flex items-center justify-center">
          <div className="text-8xl">📦</div>
        </div>

        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {data.productName}
          </h1>

          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-2xl font-bold text-blue-600">
              {(data.price ?? 0).toFixed(2)} €
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Beschreibung
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {data.description || "Keine detaillierte Beschreibung verfügbar."}
            </p>
          </div>

          {data.category && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Kategorie
              </h3>
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {data.category}
              </span>
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => orderMutation.mutate()}
              disabled={orderMutation.isLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
            >
              {orderMutation.isLoading
                ? "Wird bestellt..."
                : "Direkt bestellen"}
            </button>
          </div>
          {orderMutation.error?.userMessage && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              {orderMutation.error.userMessage}{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-medium underline"
              >
                Zum Login
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

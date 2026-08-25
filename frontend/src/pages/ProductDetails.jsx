import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/apiClient";
import useStore from "../store/useStore";
import OrderFormModal, { needsOrderForm } from "../components/OrderFormModal";

async function fetchProduct(id) {
  const res = await api.get(`/api/products/${id}`);
  return res.data;
}

export default function ProductDetails() {
  const [showOrderForm, setShowOrderForm] = useState(false);
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
    (details = {}) =>
      api.post("/api/orders", {
        orderId: Date.now(),
        product: data._id,
        user: user.id,
        orderStatus: 1,
        orderDetails: details,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orders", user?.id]);
        navigate("/orders");
      },
    },
  );

  function orderProduct(details = {}) {
    if (needsOrderForm(data.productName) && Object.keys(details).length === 0) {
      setShowOrderForm(true);
      return;
    }
    orderMutation.mutate(details);
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse">
          <div className="mb-6 h-96 bg-[#878d92]/30"></div>
          <div className="mb-4 h-10 w-2/3 bg-[#878d92]/30"></div>
          <div className="mb-6 h-6 w-1/3 bg-[#878d92]/30"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-4 border border-[#b42f32]/30 bg-[#b42f32]/10 p-6 text-[#b42f32]">
          Fehler beim Laden des Produkts.
        </div>
        <button
          onClick={() => navigate("/products")}
          className="rounded-sm bg-[#b42f32] px-4 py-2 text-[#e3e3cd] transition-colors hover:bg-[#8f2528]"
        >
          ← Zurück
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <button
        onClick={() => navigate("/products")}
        className="mb-8 inline-flex items-center gap-2 font-medium text-[#b42f32] hover:text-[#df6747]"
      >
        ← Zurück zu Produkten
      </button>

      <div className="overflow-hidden border border-[#878d92]/40 bg-[#e3e3cd] shadow-[0_8px_24px_rgba(73,73,77,0.12)]">
        <div className="flex h-64 items-center justify-center bg-[#b42f32] md:h-96">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e3e3cd]">
            eGov Services
          </div>
        </div>

        <div className="p-8">
          <h1 className="mb-4 text-4xl font-bold text-[#49494d]">
            {data.productName}
          </h1>

          <div className="mb-6 border-b border-[#878d92]/50 pb-6">
            <p className="text-2xl font-bold text-[#b42f32]">
              {(data.price ?? 0).toFixed(2)} CHF
            </p>
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-lg font-semibold text-[#49494d]">
              Beschreibung
            </h3>
            <p className="leading-relaxed text-[#878d92]">
              {data.description || "Keine detaillierte Beschreibung verfügbar."}
            </p>
          </div>

          {data.category && (
            <div className="mb-8">
              <h3 className="mb-3 text-lg font-semibold text-[#49494d]">
                Kategorie
              </h3>
              <span className="inline-block bg-[#df6747]/20 px-4 py-2 text-sm font-medium text-[#b42f32]">
                {data.category}
              </span>
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => orderProduct()}
              disabled={orderMutation.isLoading}
              className="rounded-sm bg-[#b42f32] px-8 py-3 text-lg font-semibold text-[#e3e3cd] transition-colors hover:bg-[#8f2528]"
            >
              {orderMutation.isLoading
                ? "Wird bestellt..."
                : "Direkt bestellen"}
            </button>
          </div>
          {orderMutation.error?.userMessage && (
            <div className="mt-4 border border-[#b42f32]/30 bg-[#b42f32]/10 p-4 text-[#b42f32]">
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
      {showOrderForm && (
        <OrderFormModal
          product={data}
          isLoading={orderMutation.isLoading}
          onClose={() => setShowOrderForm(false)}
          onSubmit={(details) => orderProduct(details)}
        />
      )}
    </section>
  );
}

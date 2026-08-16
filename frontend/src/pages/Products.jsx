import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/apiClient";
import useStore from "../store/useStore";

async function fetchProducts() {
  const res = await api.get("/api/products");
  return res.data;
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded mb-4"></div>
      <div className="h-4 bg-slate-200 rounded mb-4 w-2/3"></div>
      <div className="h-10 bg-slate-200 rounded"></div>
    </div>
  );
}

export default function Products() {
  const { data, isLoading, error } = useQuery(["products"], fetchProducts);
  const addToCart = useStore((s) => s.addToCart);

  if (isLoading) {
    return (
      <section className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Produkte</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Produkte</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6">
          Fehler beim Laden der Produkte.
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Produkte</h1>

      {data && data.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-6 text-center">
          Keine Produkte verfügbar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                <div className="text-4xl">📦</div>
              </div>
              <div className="p-6">
                <Link
                  to={`/products/${p._id}`}
                  className="text-xl font-bold text-slate-900 hover:text-blue-600 transition block mb-2"
                >
                  {p.productName}
                </Link>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {p.description || "Keine Beschreibung verfügbar"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    {(p.price ?? 0).toFixed(2)} €
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      addToCart({
                        productId: p._id,
                        productName: p.productName,
                        price: p.price ?? 0,
                      })
                    }
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                  >
                    In den Warenkorb
                  </button>
                  <Link
                    to={`/products/${p._id}`}
                    className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium text-sm"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/apiClient";
import useStore from "../store/useStore";

async function fetchProducts({ queryKey }) {
  const [, filters] = queryKey;
  const params = {
    name: filters.search || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
  };
  const res = await api.get("/api/products/search", { params });
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
  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
  });
  const { data, isLoading, error } = useQuery(
    ["products", filters],
    fetchProducts,
    { keepPreviousData: true },
  );
  const user = useStore((s) => s.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const products = data || [];
  const filteredProducts = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minimum = filters.minPrice === "" ? 0 : Number(filters.minPrice);
    const maximum =
      filters.maxPrice === ""
        ? Number.MAX_SAFE_INTEGER
        : Number(filters.maxPrice);

    return products.filter((product) => {
      const searchableText =
        `${product.productName} ${product.description || ""}`.toLowerCase();
      const matchesSearch = !search || searchableText.includes(search);
      const matchesPrice = product.price >= minimum && product.price <= maximum;
      return matchesSearch && product.productActive && matchesPrice;
    });
  }, [filters, products]);

  function updateFilter(event) {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  }

  function resetFilters() {
    setFilters({ search: "", minPrice: "", maxPrice: "" });
  }

  const orderMutation = useMutation(
    (product) =>
      api.post("/api/orders", {
        orderId: Date.now(),
        product: product._id,
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
  const orderErrorMessage =
    orderMutation.error?.userMessage ||
    orderMutation.error?.response?.data?.error ||
    (orderMutation.error && "Die Bestellung konnte nicht aufgegeben werden.");

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
          {error.response?.data?.error ||
            error.userMessage ||
            "Die Produkte konnten nicht geladen werden."}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Produkte</h1>
      {orderErrorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 mb-6">
          {orderErrorMessage}{" "}
          <Link to="/login" className="font-medium underline">
            Zum Login
          </Link>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="lg:col-span-2">
            <span className="block text-sm font-medium text-slate-700 mb-2">
              Suche
            </span>
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              type="search"
              placeholder="Name oder Beschreibung"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="block text-sm font-medium text-slate-700 mb-2">
                Preis ab
              </span>
              <input
                name="minPrice"
                value={filters.minPrice}
                onChange={updateFilter}
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>
            <label>
              <span className="block text-sm font-medium text-slate-700 mb-2">
                Preis bis
              </span>
              <input
                name="maxPrice"
                value={filters.maxPrice}
                onChange={updateFilter}
                type="number"
                min="0"
                step="0.01"
                placeholder="9999"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-slate-600">
            {filteredProducts.length} Produkt
            {filteredProducts.length === 1 ? "" : "e"} gefunden
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium text-sm"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-6 text-center">
          Keine Produkte für diese Suche oder Filter gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                <div className="text-4xl">📦</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <Link
                  to={`/products/${p._id}`}
                  className="text-xl font-bold text-slate-900 hover:text-blue-600 transition block mb-2 min-h-[3.5rem] line-clamp-2"
                >
                  {p.productName}
                </Link>
                <p className="text-slate-600 text-sm mb-4 min-h-[3rem] line-clamp-2">
                  {p.description || "Keine Beschreibung verfügbar"}
                </p>
                <div className="flex items-center justify-between min-h-[2.5rem]">
                  <span className="text-2xl font-bold text-blue-600">
                    {(p.price ?? 0).toFixed(2)} €
                  </span>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <button
                    onClick={() => orderMutation.mutate(p)}
                    disabled={orderMutation.isLoading}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                  >
                    Direkt bestellen
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

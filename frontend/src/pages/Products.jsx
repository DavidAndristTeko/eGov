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
    <div className="animate-pulse border border-[#878d92]/40 bg-[#e3e3cd] p-6">
      <div className="mb-4 h-6 rounded-sm bg-[#878d92]/30"></div>
      <div className="mb-4 h-4 w-2/3 rounded-sm bg-[#878d92]/30"></div>
      <div className="h-10 rounded-sm bg-[#878d92]/30"></div>
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
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-[#49494d]">Produkte</h1>
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
        <div className="border border-[#b42f32]/30 bg-[#b42f32]/10 p-6 text-[#b42f32]">
          {error.response?.data?.error ||
            error.userMessage ||
            "Die Produkte konnten nicht geladen werden."}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-[#49494d]">Produkte</h1>
      {orderErrorMessage && (
        <div className="mb-6 border border-[#b42f32]/30 bg-[#b42f32]/10 p-6 text-[#b42f32]">
          {orderErrorMessage}{" "}
          <Link to="/login" className="font-medium underline">
            Zum Login
          </Link>
        </div>
      )}

      <div className="mb-8 border border-[#878d92]/40 bg-[#f4f3e8] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="lg:col-span-2">
            <span className="mb-2 block text-sm font-medium text-[#49494d]">
              Suche
            </span>
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              type="search"
              placeholder="Name oder Beschreibung"
              className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:outline-none focus:ring-2 focus:ring-[#df6747]"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-[#49494d]">
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
                className="w-full border border-[#878d92] bg-[#e3e3cd] px-3 py-2 text-[#49494d] focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-[#49494d]">
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
                className="w-full border border-[#878d92] bg-[#e3e3cd] px-3 py-2 text-[#49494d] focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-[#878d92]">
            {filteredProducts.length} Produkt
            {filteredProducts.length === 1 ? "" : "e"} gefunden
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-sm border border-[#878d92] px-4 py-2 text-sm font-medium text-[#49494d] transition-colors hover:bg-[#878d92]/20"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="border border-[#df6747]/40 bg-[#df6747]/10 p-6 text-center text-[#49494d]">
          Keine Produkte für diese Suche oder Filter gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="flex h-full flex-col overflow-hidden border border-[#878d92]/40 bg-[#e3e3cd] transition-shadow hover:shadow-[0_8px_24px_rgba(73,73,77,0.16)]"
            >
              <div className="flex h-32 items-center justify-center bg-[#878d92] px-5 text-center">
                <div className="text-lg font-semibold tracking-tight text-[#e3e3cd]">
                  {p.productName}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <Link
                  to={`/products/${p._id}`}
                  className="mb-2 block min-h-[3.5rem] text-xl font-bold text-[#49494d] transition-colors hover:text-[#b42f32] line-clamp-2"
                >
                  {p.productName}
                </Link>
                <p className="mb-4 min-h-[3rem] text-sm text-[#878d92] line-clamp-2">
                  {p.description || "Keine Beschreibung verfügbar"}
                </p>
                <div className="flex items-center justify-between min-h-[2.5rem]">
                  <span className="text-2xl font-bold text-[#49494d]">
                    {(p.price ?? 0).toFixed(2)} CHF
                  </span>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <button
                    onClick={() => orderMutation.mutate(p)}
                    disabled={orderMutation.isLoading}
                    className="flex-1 rounded-sm bg-[#b42f32] py-2 text-sm font-medium text-[#e3e3cd] transition-colors hover:bg-[#8f2528]"
                  >
                    Direkt bestellen
                  </button>
                  <Link
                    to={`/products/${p._id}`}
                    className="rounded-sm border border-[#878d92] px-4 py-2 text-sm font-medium text-[#49494d] transition-colors hover:bg-[#878d92]/20"
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

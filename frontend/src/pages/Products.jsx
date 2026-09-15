import React, { useMemo, useState } from "react"; // useMemo für optimierte Performance (berechnet Werte nur wenn nötig)
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/apiClient";
import useStore from "../store/useStore";
import OrderFormModal, { needsOrderForm } from "../components/OrderFormModal";

// intelligentes Datenfetching
async function fetchProducts({ queryKey }) {
  // gibt queryKey
  const [, filters] = queryKey; // dekonstruiere das 2. element
  const params = {
    // nur nicht-leere Filter senden
    name: filters.search || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
  };
  const res = await api.get("/api/products/search", { params });
  return res.data;
}

function ProductSkeleton() {
  // loading Placeholder
  return (
    <div className="animate-pulse border border-[#878d92]/40 bg-[#e3e3cd] p-6">
      <div className="mb-4 h-6 rounded-sm bg-[#878d92]/30"></div>
      <div className="mb-4 h-4 w-2/3 rounded-sm bg-[#878d92]/30"></div>
      <div className="h-10 rounded-sm bg-[#878d92]/30"></div>
    </div>
  );
}

export default function Products() {
  // Produktliste mit Filtern
  const [formProduct, setFormProduct] = useState(null);
  const [filters, setFilters] = useState({
    // aktuelle Filter-Werte
    search: "",
    minPrice: "",
    maxPrice: "",
  });
  const minimumPrice =
    filters.minPrice === "" ? null : Number(filters.minPrice);
  const maximumPrice =
    filters.maxPrice === "" ? null : Number(filters.maxPrice);
  const isPriceRangeValid =
    minimumPrice === null ||
    maximumPrice === null ||
    minimumPrice < maximumPrice;
  const { data, isLoading, error } = useQuery(
    ["products", filters], // neuladen wenn filter ändern
    fetchProducts,
    { keepPreviousData: true, enabled: isPriceRangeValid }, // zeigt alte Produkte während neue Daten laden
  );
  const user = useStore((s) => s.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const products = data || []; // vom Server geladene Produkte
  // Performance Optimierung
  const filteredProducts = useMemo(() => {
    // wird nur ausgeführt wenn filters, prodcuts sich ändert
    if (!isPriceRangeValid) return [];
    const search = filters.search.trim().toLowerCase();
    const minimum = filters.minPrice === "" ? 0 : Number(filters.minPrice);
    const maximum =
      filters.maxPrice === ""
        ? Number.MAX_SAFE_INTEGER
        : Number(filters.maxPrice);

    return products
      .filter((product) => {
        const searchableText =
          `${product.productName} ${product.description || ""}`.toLowerCase();
        const matchesSearch = !search || searchableText.includes(search);
        const matchesPrice =
          product.price >= minimum && product.price <= maximum;
        return matchesSearch && product.productActive && matchesPrice;
      })
      .sort((a, b) => a.productId - b.productId); //Sortiert aufsteigend nach productId, damit die 3 echten Dienstleistungen (2001-2003) immer zuerst erscheinen
  }, [filters, isPriceRangeValid, products]);

  function updateFilter(event) {
    // aktualisiert filter
    setFilters({ ...filters, [event.target.name]: event.target.value });
  }

  function resetFilters() {
    // setzt alles auf leer
    setFilters({ search: "", minPrice: "", maxPrice: "" });
  }

  const orderMutation = useMutation(
    // Bestellung
    ({ product, details }) =>
      api.post("/api/orders", {
        // POST zu /api/orders
        orderId: Date.now(),
        product: product._id,
        user: user.id,
        orderStatus: 1,
        orderDetails: details,
      }),
    {
      onSuccess: () => {
        // wenn success gehe zu /orders
        queryClient.invalidateQueries(["orders", user?.id]);
        navigate("/orders");
      },
    },
  );
  const orderErrorMessage =
    orderMutation.error?.userMessage ||
    orderMutation.error?.response?.data?.error ||
    (orderMutation.error && "Die Bestellung konnte nicht aufgegeben werden.");

  function orderProduct(product) {
    if (needsOrderForm(product.productName)) {
      setFormProduct(product);
      return;
    }
    orderMutation.mutate({ product });
  }

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
        {!isPriceRangeValid && (
          <p className="mt-3 text-sm text-[#b42f32]" role="alert">
            Der Preis ab muss kleiner sein als der Preis bis.
          </p>
        )}
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
              <div className="relative h-32 overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#878d92] px-5 text-center">
                    <div className="text-lg font-semibold tracking-tight text-[#e3e3cd]">
                      {p.productName}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-[#49494d]">
                  {p.productName}
                </h3>
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
                    onClick={() => orderProduct(p)}
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
      {formProduct && (
        <OrderFormModal
          product={formProduct}
          isLoading={orderMutation.isLoading}
          onClose={() => setFormProduct(null)}
          onSubmit={(details) =>
            orderMutation.mutate({ product: formProduct, details })
          }
        />
      )}
    </section>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/apiClient";

async function fetchProducts() {
  const res = await api.get("/api/products");
  return res.data;
}

function ProductSkeleton() {
  return <li style={{ padding: "0.5rem 0", opacity: 0.6 }}>Laden...</li>;
}

export default function Products() {
  const { data, isLoading, error } = useQuery(["products"], fetchProducts);

  if (isLoading)
    return (
      <section>
        <h1>Produkte</h1>
        <ul>
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </ul>
      </section>
    );

  if (error) return <p>Fehler beim Laden der Produkte.</p>;

  return (
    <section>
      <h1>Produkte</h1>
      <ul>
        {data?.map((p) => (
          <li key={p._id}>
            <Link to={`/products/${p._id}`}>{p.productName}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

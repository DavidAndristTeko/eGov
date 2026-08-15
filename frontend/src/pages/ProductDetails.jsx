import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/apiClient";

async function fetchProduct(id) {
  const res = await api.get(`/api/products/${id}`);
  return res.data;
}

export default function ProductDetails() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(
    ["product", id],
    () => fetchProduct(id),
    {
      enabled: !!id,
    },
  );

  if (isLoading) return <p>Produkt wird geladen...</p>;
  if (error) return <p>Fehler beim Laden des Produkts.</p>;

  return (
    <section>
      <h1>{data.productName}</h1>
      <p>{data.description}</p>
      <p>Preis: {data.price} €</p>
    </section>
  );
}

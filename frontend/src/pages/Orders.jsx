import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// holt daten auf dem server, ändrt daten auf dem server, manager aller daten
import useStore from "../store/useStore"; // globale user daten
import api from "../api/apiClient"; // API Client

async function fetchOrders(userId) {
  // Daten vom Server holen
  const res = await api.get(`/api/users/${userId}/orders`);
  return res.data;
}

// Normalisiert Keys um Inkonsistenzen zu beheben (verschiedene Schreibweisen)
function normalizeKey(key) {
  return key.toLowerCase().replace(
    /[äöü]/g,
    (c) =>
      ({
        ä: "ae",
        ö: "oe",
        ü: "ue",
      })[c],
  );
}

// Einheitliche Labelübersetzung (nur eine Version pro Key)
const LABEL_MAP = {
  artdesgebaeudes: "Art des Gebäudes",
  bauortadresse: "Bauort / Adresse",
  projektbeschreibung: "Projektbeschreibung",
  vorname: "Vorname",
  nachname: "Nachname",
  geburtsdatum: "Geburtsdatum",
  adresse: "Adresse",
  kategorie: "Fahrzeugkategorie",
  tierart: "Tierart",
  anzahltiere: "Anzahl Tiere",
  haltungsortadresse: "Haltungsort / Adresse",
};

export default function Orders() {
  // Verschiedene States
  const [orderToCancel, setOrderToCancel] = useState(null);
  const user = useStore((s) => s.user); // aktuelle Benutzer laden aus dem store
  const queryClient = useQueryClient(); // manager für alle daten

  const { data, isLoading, error } = useQuery(
    // Daten laden
    ["orders", user?.id], // eindeutige ID abfrage
    () => fetchOrders(user.id), // funktion zum laden der Daten
    {
      enabled: !!user?.id, // nur laden wenn user.id existiert
    },
  ); // ergebnis: data: geladene bestellungen, isloading true während laden, false danach, error: fehler falls was schiefgeht

  const mutation = useMutation(
    (orderId) => api.delete(`/api/orders/${orderId}`), // sendet delete zu /api/orders/123, löscht die bestellung auf dem server
    {
      onMutate: async (orderId) => {
        // Optimistic Update
        await queryClient.cancelQueries(["orders", user.id]); // stoppt aktuelle Queries (keine neue Anfragen)
        const previous = queryClient.getQueryData(["orders", user.id]); //Speichert alte Daten (als Backup, falls es schiefgeht)
        queryClient.setQueryData(
          ["orders", user.id],
          (
            old = [], // ändert die Daten sofort im cache (ohne auf den Server zu warten)
          ) =>
            old.map((o) => (o._id === orderId ? { ...o, orderStatus: 2 } : o)),
        );
        return { previous }; // falls Server antwortet mit Fehler -> rollback zu previous
      },
      onError: (_err, _orderId, { previous }) => {
        // destrukturiert direkt den context
        queryClient.setQueryData(["orders", user.id], previous);
        alert("Fehler beim Stornieren der Bestellung.");
      },
      onSettled: () => {
        // egal ob erfolg oder fehler: sagt dass die daten veraltet sind, dass frische daten beim nächsten mal geholt werden
        queryClient.invalidateQueries(["orders", user.id]);
      },
    },
  );

  if (!user) {
    // nicht angemeldet
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
                    <span
                      className={
                        o.orderStatus === 2
                          ? "inline-block bg-[#b42f32]/20 px-3 py-1 text-sm text-[#b42f32]"
                          : "inline-block bg-[#4f7942]/20 px-3 py-1 text-sm text-[#4f7942]"
                      }
                    >
                      {o.orderStatus === 2 ? "Storniert" : "Wird ausgeliefert"}
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

              {o.orderDetails &&
                Object.keys(o.orderDetails).length > 0 && ( // nur wenn orderDetails existieren UND nicht leer
                  <div className="mb-6 border-t border-[#878d92]/40 pt-4">
                    <p className="mb-2 text-sm text-[#878d92]">
                      Angaben zum Gesuch
                    </p>
                    <dl className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                      {Object.entries(o.orderDetails).map(([key, value]) => {
                        // Normalisiere den Key um verschiedene Schreibweisen zu handhaben
                        const normalizedKey = normalizeKey(key);
                        const label = LABEL_MAP[normalizedKey] || key;

                        return (
                          <div key={key}>
                            <dt className="text-[#878d92]">{label}</dt>
                            <dd className="text-[#49494d]">{value}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                )}

              {o.orderStatus !== 2 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setOrderToCancel(o)}
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

      {orderToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#49494d]/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
        >
          <div className="w-full max-w-md border border-[#878d92]/40 bg-[#f4f3e8] p-6 shadow-[0_8px_24px_rgba(73,73,77,0.24)]">
            <h2
              id="cancel-order-title"
              className="text-2xl font-bold text-[#49494d]"
            >
              Bestellung stornieren?
            </h2>
            <p className="mt-3 text-[#878d92]">
              Möchten Sie die Bestellung für „
              {orderToCancel.product?.productName || "dieses Produkt"}" wirklich
              stornieren?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="rounded-sm border border-[#878d92] px-4 py-2 text-sm font-medium text-[#49494d] transition-colors hover:bg-[#878d92]/20"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => {
                  mutation.mutate(orderToCancel._id);
                  setOrderToCancel(null);
                }}
                disabled={mutation.isLoading}
                className="rounded-sm bg-[#b42f32] px-4 py-2 text-sm font-medium text-[#e3e3cd] transition-colors hover:bg-[#8f2528] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Bestellung stornieren
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import React, { useState } from "react";

const formFields = {
  Baugesuch: [
    {
      name: "artDesGebaeudes",
      label: "Art des Gebäudes",
      type: "select",
      options: [
        "Einfamilienhaus",
        "Mehrfamilienhaus",
        "Gewerbebau",
        "Umbau / Renovierung",
      ],
    },
    { name: "bauortAdresse", label: "Bauort / Adresse", type: "text" },
    {
      name: "projektBeschreibung",
      label: "Projektbeschreibung",
      type: "textarea",
    },
  ],
  "Gesuch für Lernfahrausweis": [
    { name: "vorname", label: "Vorname", type: "text" },
    { name: "nachname", label: "Nachname", type: "text" },
    { name: "geburtsdatum", label: "Geburtsdatum", type: "date" },
    { name: "adresse", label: "Adresse", type: "text" },
    {
      name: "kategorie",
      label: "Fahrzeugkategorie",
      type: "select",
      options: ["A", "B", "A1", "B1"],
    },
  ],
  "Gesuch für Wildtierhaltungsbewilligung": [
    { name: "vorname", label: "Vorname", type: "text" },
    { name: "nachname", label: "Nachname", type: "text" },
    { name: "tierart", label: "Tierart", type: "text" },
    { name: "anzahlTiere", label: "Anzahl Tiere", type: "number" },
    { name: "haltungsort", label: "Haltungsort / Adresse", type: "text" },
  ],
};

export function needsOrderForm(productName = "") {
  // gibt es ein formFields? -> true -> modal öffnen
  return Object.prototype.hasOwnProperty.call(formFields, productName); // gibt es nicht? -> false -> Modal nicht nötig
}

export default function OrderFormModal({
  product,
  onSubmit,
  onClose,
  isLoading,
}) {
  const fields = formFields[product.productName] || []; // holt die Felder für dieses Produkt, falls nicht vorhanden: leeres Array []
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((field) => [field.name, ""])), // erstellt ein Objekt mit allen Feldnamen als Keys und leeren Strings als Werte
  );

  function updateValue(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#49494d]/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-form-title"
    >
      <form
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[#878d92]/40 bg-[#f4f3e8] p-6 shadow-[0_8px_24px_rgba(73,73,77,0.24)]"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="order-form-title"
              className="text-2xl font-bold text-[#49494d]"
            >
              Angaben für die Bestellung
            </h2>
            <p className="mt-1 text-sm text-[#878d92]">{product.productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-[#49494d]"
            aria-label="Formular schliessen"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <label key={field.name} className="block">
              <span className="mb-2 block text-sm font-medium text-[#49494d]">
                {field.label}
              </span>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={values[field.name]}
                  onChange={updateValue}
                  required
                  className="w-full border border-[#878d92] bg-[#e3e3cd] px-3 py-2 text-[#49494d] focus:outline-none focus:ring-2 focus:ring-[#df6747]"
                >
                  <option value="">Bitte auswählen</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={values[field.name]}
                  onChange={updateValue}
                  required
                  rows="3"
                  className="w-full border border-[#878d92] bg-[#e3e3cd] px-3 py-2 text-[#49494d] focus:outline-none focus:ring-2 focus:ring-[#df6747]"
                />
              ) : (
                <input
                  name={field.name}
                  value={values[field.name]}
                  onChange={updateValue}
                  type={field.type}
                  min={field.type === "number" ? "1" : undefined}
                  required
                  className="w-full border border-[#878d92] bg-[#e3e3cd] px-3 py-2 text-[#49494d] focus:outline-none focus:ring-2 focus:ring-[#df6747]"
                />
              )}
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-[#878d92] px-4 py-2 text-sm font-medium text-[#49494d] hover:bg-[#878d92]/20"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-sm bg-[#b42f32] px-4 py-2 text-sm font-medium text-[#e3e3cd] hover:bg-[#8f2528] disabled:opacity-50"
          >
            {isLoading ? "Wird bestellt..." : "Bestellung absenden"}
          </button>
        </div>
      </form>
    </div>
  );
}

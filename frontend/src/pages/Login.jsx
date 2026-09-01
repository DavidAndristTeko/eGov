import React, { useState } from "react"; // Hook für lokale States
import { useForm } from "react-hook-form"; // spezial Hook für Formular Verwaltung
import { useNavigate } from "react-router-dom"; // nav zu anderen seiten
import api from "../api/apiClient"; //API Client zu Server
import useStore from "../store/useStore"; // globaler store für user daten

export default function Login() {
  const {
    register, // registriert input felder
    handleSubmit, // verarbeitet formular einreichung
    formState: { errors }, // speichert validierungs fehler
  } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(""); // Fehler vom Backend z.b. falsches pw
  const [isLoading, setIsLoading] = useState(false); // wird gerade angemeldet?

  async function onSubmit(values) {
    // wenn user auf login klickt
    setServerError(""); // alte fehler nachrichten löschen
    setIsLoading(true); // button wird deaktiviert
    try {
      const res = await api.post("/api/login", values);
      // values beinhaltet benutzer und pw
      useStore.getState().setUser(res.data.user, res.data.token); // backend prüft es in mongodb
      navigate("/", { replace: true }); // ersetzt die history (retour zum login nicht möglich)
    } catch (err) {
      setServerError(err.response?.data?.error || "Login fehlgeschlagen");
    } finally {
      setIsLoading(false); // Button aktivieren. egal ob fehler oder nicht
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <div className="border border-[#878d92]/40 bg-[#e3e3cd] p-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-[#49494d]">
          Login
        </h1>

        {serverError && (
          <div className="mb-4 border border-[#b42f32]/30 bg-[#b42f32]/10 p-4 text-[#b42f32]">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#49494d]">
              Username
            </label>
            <input
              {...register("userName", {
                required: "Username ist erforderlich",
              })}
              className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              placeholder="Geben Sie Ihren Username ein"
            />
            {errors.userName && (
              <small className="mt-1 block text-[#b42f32]">
                {errors.userName.message}
              </small>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#49494d]">
              Passwort
            </label>
            <input
              type="password"
              {...register("password", {
                // registiriert das input feld bei useform
                required: "Passwort ist erforderlich",
              })}
              className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              placeholder="Geben Sie Ihr Passwort ein"
            />
            {errors.password && (
              <small className="mt-1 block text-[#b42f32]">
                {errors.password.message}
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-sm bg-[#b42f32] py-2 font-medium text-[#e3e3cd] transition-colors hover:bg-[#8f2528] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Wird angemeldet..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#878d92]">
          Noch kein Konto?{" "}
          <a
            href="/register"
            className="font-medium text-[#b42f32] hover:text-[#df6747]"
          >
            Jetzt registrieren
          </a>
        </div>
      </div>
    </section>
  );
}

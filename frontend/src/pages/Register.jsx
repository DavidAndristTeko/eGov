import React, { useState } from "react";
import { useForm } from "react-hook-form"; // formular hook
import { zodResolver } from "@hookform/resolvers/zod"; // verbindet Zod Validierung mit useForm
import * as z from "zod"; // neue Bibliothek
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";

const registerSchema = z
  .object({
    firstname: z
      .string() // muss string sein
      .trim() // space entfernen
      .min(1, "Vorname ist erforderlich") // mind 1 zeichen
      .min(2, "Vorname muss mindestens 2 Zeichen haben"), // mind 1 zeichen
    lastname: z
      .string()
      .trim()
      .min(1, "Nachname ist erforderlich")
      .min(2, "Nachname muss mindestens 2 Zeichen haben"),
    userName: z.string().min(2, "Username muss mindestens 2 Zeichen haben"),
    password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
    passwordConfirm: z.string(), // wird mit password verglichen
  })
  // zusätzliche Validerung
  .refine((d) => d.password === d.passwordConfirm, {
    // stimmen die PWs überein?
    path: ["passwordConfirm"], // fehler würde hier angezeigt werden
    message: "Passwörter stimmen nicht überein",
  });

export default function Register() {
  const {
    register, // registriert Input Felder
    handleSubmit, // Verarbeitet Form einreichung
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) }); // nutzt Zod oben zur Validierung
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(""); // Fehler vom Backend
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    // Registierung
    setServerError("");
    setIsLoading(true);
    try {
      const payload = {
        userId: Date.now(),
        firstname: data.firstname,
        lastname: data.lastname,
        userName: data.userName,
        password: data.password,
      };

      const res = await api.post("/api/users", payload); // sendet es zum backend
      if (res?.status === 201) {
        // bei 201
        navigate("/login", { replace: true }); // navigiert zu /login
      }
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Fehler bei Registrierung";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <div className="border border-[#878d92]/40 bg-[#e3e3cd] p-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-[#49494d]">
          Registrieren
        </h1>

        {serverError && (
          <div className="mb-4 border border-[#b42f32]/30 bg-[#b42f32]/10 p-4 text-[#b42f32]">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#49494d]">
              Vorname <span className="text-[#b42f32]">*</span>
            </label>
            <input
              {...register("firstname")}
              required
              className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              placeholder="Geben Sie Ihren Vornamen ein"
            />
            {errors.firstname && (
              <small className="mt-1 block text-[#b42f32]">
                {errors.firstname.message}
              </small>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#49494d]">
              Nachname <span className="text-[#b42f32]">*</span>
            </label>
            <input
              {...register("lastname")}
              required
              className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              placeholder="Geben Sie Ihren Nachnamen ein"
            />
            {errors.lastname && (
              <small className="mt-1 block text-[#b42f32]">
                {errors.lastname.message}
              </small>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#49494d]">
              Username
            </label>
            <input
              {...register("userName")}
              className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              placeholder="Wählen Sie einen Username"
            />
            {errors.userName && (
              <small className="mt-1 block text-[#b42f32]">
                {errors.userName.message}
              </small>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#49494d]">
              Passwort (min. 8 Zeichen)
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              placeholder="Wählen Sie ein sicheres Passwort"
            />
            {errors.password && (
              <small className="mt-1 block text-[#b42f32]">
                {errors.password.message}
              </small>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#49494d]">
              Passwort wiederholen
            </label>
            <input
              type="password"
              {...register("passwordConfirm")}
              className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              placeholder="Wiederholen Sie Ihr Passwort"
            />
            {errors.passwordConfirm && (
              <small className="mt-1 block text-[#b42f32]">
                {errors.passwordConfirm.message}
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-sm bg-[#b42f32] py-2 font-medium text-[#e3e3cd] transition-colors hover:bg-[#8f2528] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Wird registriert..." : "Registrieren"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#878d92]">
          Haben Sie bereits ein Konto?{" "}
          <a
            href="/login"
            className="font-medium text-[#b42f32] hover:text-[#df6747]"
          >
            Zum Login
          </a>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";

const registerSchema = z
  .object({
    firstname: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
    lastname: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
    userName: z.string().min(2, "Username muss mindestens 2 Zeichen haben"),
    password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwörter stimmen nicht überein",
  });

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
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

      const res = await api.post("/api/users", payload);
      if (res?.status === 201) {
        navigate("/login", { replace: true });
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
    <section className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-900">
          Registrieren
        </h1>

        {serverError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Vorname
            </label>
            <input
              {...register("firstname")}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Geben Sie Ihren Vornamen ein"
            />
            {errors.firstname && (
              <small className="text-red-600 block mt-1">
                {errors.firstname.message}
              </small>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nachname
            </label>
            <input
              {...register("lastname")}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Geben Sie Ihren Nachnamen ein"
            />
            {errors.lastname && (
              <small className="text-red-600 block mt-1">
                {errors.lastname.message}
              </small>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              {...register("userName")}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Wählen Sie einen Username"
            />
            {errors.userName && (
              <small className="text-red-600 block mt-1">
                {errors.userName.message}
              </small>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Passwort (min. 8 Zeichen)
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Wählen Sie ein sicheres Passwort"
            />
            {errors.password && (
              <small className="text-red-600 block mt-1">
                {errors.password.message}
              </small>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Passwort wiederholen
            </label>
            <input
              type="password"
              {...register("passwordConfirm")}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Wiederholen Sie Ihr Passwort"
            />
            {errors.passwordConfirm && (
              <small className="text-red-600 block mt-1">
                {errors.passwordConfirm.message}
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Wird registriert..." : "Registrieren"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Haben Sie bereits ein Konto?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Zum Login
          </a>
        </div>
      </div>
    </section>
  );
}

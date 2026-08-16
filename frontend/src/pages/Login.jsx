import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import { setToken } from "../auth/auth";
import useStore from "../store/useStore";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values) {
    setServerError("");
    setIsLoading(true);
    try {
      const res = await api.post("/api/login", values);
      useStore.getState().setUser(res.data.user, res.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || "Login fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-900">
          Login
        </h1>

        {serverError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              {...register("userName", {
                required: "Username ist erforderlich",
              })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Geben Sie Ihren Username ein"
            />
            {errors.userName && (
              <small className="text-red-600 block mt-1">
                {errors.userName.message}
              </small>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Passwort
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Passwort ist erforderlich",
              })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Geben Sie Ihr Passwort ein"
            />
            {errors.password && (
              <small className="text-red-600 block mt-1">
                {errors.password.message}
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Wird angemeldet..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Noch kein Konto?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Jetzt registrieren
          </a>
        </div>
      </div>
    </section>
  );
}

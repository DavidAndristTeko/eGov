import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import useStore from "../store/useStore";

export default function Account() {
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const setUser = useStore((state) => state.setUser);
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    userName: user?.userName || "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    const payload = { ...formData };
    if (!payload.password) delete payload.password;

    try {
      const response = await api.put(`/api/users/${user.id}`, payload);
      const { password, ...updatedUser } = response.data;
      updatedUser.id = updatedUser._id || user.id;
      setUser(updatedUser, token);
      setFormData((current) => ({ ...current, password: "" }));
      setMessage("Ihre Kontodaten wurden gespeichert.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Die Kontodaten konnten nicht gespeichert werden.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Möchten Sie Ihr Nutzerkonto wirklich löschen?"))
      return;

    setError("");
    setIsDeleting(true);
    try {
      await api.delete(`/api/users/${user.id}`);
      logout();
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Das Nutzerkonto konnte nicht gelöscht werden.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <section className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Mein Konto</h1>
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ["firstname", "Vorname", "text"],
            ["lastname", "Nachname", "text"],
            ["userName", "Username", "text"],
            ["password", "Neues Passwort (optional)", "password"],
          ].map(([name, label, type]) => (
            <label key={name} className="block">
              <span className="block text-sm font-medium text-slate-700 mb-2">
                {label}
              </span>
              <input
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                required={name !== "password"}
                minLength={name === "password" ? 8 : 2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={isSaving || isDeleting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Wird gespeichert..." : "Änderungen speichern"}
          </button>
        </form>

        <div className="border-t border-slate-200 mt-8 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Konto löschen
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Dabei werden auch Ihre Bestellungen gelöscht.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Konto wird gelöscht..." : "Konto endgültig löschen"}
          </button>
        </div>
      </div>
    </section>
  );
}

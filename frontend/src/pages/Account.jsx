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
    <section className="mx-auto max-w-md px-4 py-12">
      <div className="border border-[#878d92]/40 bg-[#e3e3cd] p-8">
        <h1 className="mb-6 text-3xl font-bold text-[#49494d]">Mein Konto</h1>
        {message && (
          <div className="mb-4 border border-[#878d92]/40 bg-[#878d92]/15 p-4 text-[#49494d]">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 border border-[#b42f32]/30 bg-[#b42f32]/10 p-4 text-[#b42f32]">
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
              <span className="mb-2 block text-sm font-medium text-[#49494d]">
                {label}
              </span>
              <input
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                required={name !== "password"}
                minLength={name === "password" ? 8 : 2}
                className="w-full border border-[#878d92] bg-[#e3e3cd] px-4 py-2 text-[#49494d] focus:outline-none focus:ring-2 focus:ring-[#df6747]"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={isSaving || isDeleting}
            className="w-full rounded-sm bg-[#b42f32] px-4 py-2 font-medium text-[#e3e3cd] transition-colors hover:bg-[#8f2528] disabled:opacity-50"
          >
            {isSaving ? "Wird gespeichert..." : "Änderungen speichern"}
          </button>
        </form>

        <div className="mt-8 border-t border-[#878d92]/50 pt-6">
          <h2 className="mb-2 text-lg font-semibold text-[#49494d]">
            Konto löschen
          </h2>
          <p className="mb-4 text-sm text-[#878d92]">
            Dabei werden auch Ihre Bestellungen gelöscht.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            className="w-full rounded-sm bg-[#49494d] px-4 py-2 font-medium text-[#e3e3cd] transition-colors hover:bg-[#b42f32] disabled:opacity-50"
          >
            {isDeleting ? "Konto wird gelöscht..." : "Konto endgültig löschen"}
          </button>
        </div>
      </div>
    </section>
  );
}

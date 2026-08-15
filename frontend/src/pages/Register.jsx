import React from "react";
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

  const onSubmit = async (data) => {
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
        alert("Registrierung erfolgreich. Bitte einloggen.");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Fehler bei Registrierung";
      alert(message);
    }
  };

  return (
    <section>
      <h1>Registrieren</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Vorname</label>
          <input {...register("firstname")} />
          {errors.firstname && <small>{errors.firstname.message}</small>}
        </div>
        <div>
          <label>Nachname</label>
          <input {...register("lastname")} />
          {errors.lastname && <small>{errors.lastname.message}</small>}
        </div>
        <div>
          <label>Username</label>
          <input {...register("userName")} />
          {errors.userName && <small>{errors.userName.message}</small>}
        </div>
        <div>
          <label>Passwort</label>
          <input type="password" {...register("password")} />
          {errors.password && <small>{errors.password.message}</small>}
        </div>
        <div>
          <label>Passwort wiederholen</label>
          <input type="password" {...register("passwordConfirm")} />
          {errors.passwordConfirm && (
            <small>{errors.passwordConfirm.message}</small>
          )}
        </div>
        <button type="submit">Registrieren</button>
      </form>
    </section>
  );
}

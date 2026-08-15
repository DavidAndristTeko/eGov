import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import { setToken } from "../auth/auth";
import useStore from "../store/useStore";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  async function onSubmit(values) {
    try {
      const res = await api.post("/api/login", values);
      // store token and user in global store
      useStore.getState().setUser(res.data.user, res.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      alert(err.response?.data?.error || "Login fehlgeschlagen");
    }
  }

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Username</label>
          <input {...register("userName")} />
        </div>
        <div>
          <label>Passwort</label>
          <input type="password" {...register("password")} />
        </div>
        <button>Login</button>
      </form>
    </section>
  );
}

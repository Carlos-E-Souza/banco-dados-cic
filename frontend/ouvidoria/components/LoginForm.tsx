"use client";

import axios from "axios";
import { useState } from "react";
import { useUser } from "./UserContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { setEmail: setLoggedEmail, setIsFuncionario } = useUser();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    
    try {
      // const response = await axios.post(
      //   "http://localhost:8000/auth/login",
      //   { email, password },
      //   { timeout: 10000 }
      // );
      // TODO: substituir console.log por lógica de autenticação (armazenar token, redirecionar, etc.)
      const normalizedEmail = email.trim();
      // const isFuncionario = Boolean(response.data?.isFuncionario);
      const isFuncionario = false;
      console.log({ email: normalizedEmail, password });
      setLoggedEmail(normalizedEmail);
      setIsFuncionario(isFuncionario);
    } catch (error) {
      // if (axios.isAxiosError(error)) {
      //   setErrorMessage(error.response?.data?.message ?? "Não foi possível entrar. Tente novamente.");
      // } else {
      //   setErrorMessage("Erro inesperado. Tente novamente em instantes.");
      // }
      setErrorMessage("Erro de autenticação simulada.");
      setLoggedEmail(null);
      setIsFuncionario(false);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-neutral-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seu.email@dominio.com"
          className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-neutral-800">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={passwordVisibility ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            className="w-full rounded-full border border-neutral-300 px-4 py-3 pr-12 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-3 inline-flex items-center rounded-full px-3 text-xs font-semibold text-neutral-600 transition-colors hover:text-lime-600"
          >
            {passwordVisibility ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
      <button
        type="submit"
        className="w-full rounded-full border border-lime-500 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-lime-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
};

export default LoginForm;

"use client";

import axios from "axios";
import { useState } from "react";

const CadastroForm = () => {
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // const response = await axios.post(
      //   "http://localhost:8000/auth/register",
      //   {
      //     email,
      //     endereco,
      //     cpf,
      //     senha,
      //     dataNascimento,
      //   },
      //   { timeout: 10000 }
      // );
      // TODO: substituir console.log por lógica pós-registro (ex.: redirecionar, exibir feedback etc.)
      console.log({ email, endereco, cpf, dataNascimento, senha });
      setSuccessMessage("Cadastro enviado (simulado).");
    } catch (error) {
      // if (axios.isAxiosError(error)) {
      //   setErrorMessage(error.response?.data?.message ?? "Não foi possível concluir o cadastro.");
      // } else {
      //   setErrorMessage("Erro inesperado. Tente novamente em instantes.");
      // }
      setErrorMessage("Erro de cadastro simulado.");
    } finally {
      setIsLoading(false);
    }
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
        <label htmlFor="endereco" className="text-sm font-semibold text-neutral-800">
          Endereço
        </label>
        <input
          id="endereco"
          type="text"
          value={endereco}
          onChange={(event) => setEndereco(event.target.value)}
          placeholder="Rua Exemplo, 123"
          className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="cpf" className="text-sm font-semibold text-neutral-800">
          CPF
        </label>
        <input
          id="cpf"
          type="text"
          value={cpf}
          onChange={(event) => setCpf(event.target.value)}
          placeholder="000.000.000-00"
          maxLength={14}
          className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="senha" className="text-sm font-semibold text-neutral-800">
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            type={senhaVisivel ? "text" : "password"}
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Crie uma senha segura"
            className="w-full rounded-full border border-neutral-300 px-4 py-3 pr-12 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
            required
          />
          <button
            type="button"
            onClick={() => setSenhaVisivel((prev) => !prev)}
            className="absolute inset-y-0 right-3 inline-flex items-center rounded-full px-3 text-xs font-semibold text-neutral-600 transition-colors hover:text-lime-600"
          >
            {senhaVisivel ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="dataNascimento" className="text-sm font-semibold text-neutral-800">
          Data Nascimento
        </label>
        <input
          id="dataNascimento"
          type="date"
          value={dataNascimento}
          onChange={(event) => setDataNascimento(event.target.value)}
          className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
          required
        />
      </div>
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-sm text-lime-600">{successMessage}</p>
      )}
      <button
        type="submit"
        className="w-full rounded-full border border-lime-500 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-lime-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isLoading}
      >
        {isLoading ? "Enviando..." : "Cadastrar"}
      </button>
    </form>
  );
};

export default CadastroForm;

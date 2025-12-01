"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import AlertPopup from "./AlertPopup";
import DateInput from "./DateInput";

type CadastroFormState = {
  nome: string;
  email: string;
  endereco: string;
  cpf: string;
  dataNascimento: string;
  senha: string;
  telefone: string;
  ddd: string;
  estado: string;
  cidade: string;
  bairro: string;
};

const initialState: CadastroFormState = {
  nome: "",
  email: "",
  endereco: "",
  cpf: "",
  dataNascimento: "",
  senha: "",
  telefone: "",
  ddd: "",
  estado: "",
  cidade: "",
  bairro: "",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const CadastroForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CadastroFormState>(initialState);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (field: keyof CadastroFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const trimmedNome = formData.nome.trim();
      const trimmedEmail = formData.email.trim();
      const trimmedEndereco = formData.endereco.trim();
      const trimmedCpf = formData.cpf.replace(/\D/g, "");
      const trimmedTelefone = formData.telefone.trim().replace(/\D/g, "");
      const trimmedDdd = formData.ddd.trim().replace(/\D/g, "");
      const trimmedEstado = formData.estado.trim();
      const trimmedCidade = formData.cidade.trim();
      const trimmedBairro = formData.bairro.trim();
      const senha = formData.senha.trim();

      if (!trimmedNome) {
        throw new Error("Informe o nome completo.");
      }

      if (!trimmedEmail) {
        throw new Error("Informe um email válido.");
      }

      if (!trimmedEndereco) {
        throw new Error("Informe o endereço completo.");
      }

      if (!trimmedCpf || trimmedCpf.length !== 11) {
        throw new Error("Informe um CPF válido com 11 dígitos.");
      }

      if (!formData.dataNascimento) {
        throw new Error("Informe a data de nascimento.");
      }

      if (!senha) {
        throw new Error("Informe uma senha.");
      }

      if (!trimmedEstado || !trimmedCidade || !trimmedBairro) {
        throw new Error("Informe estado, cidade e bairro para definir sua localidade.");
      }

      const payload: Record<string, unknown> = {
        cpf: trimmedCpf,
        nome: trimmedNome,
        endereco: trimmedEndereco,
        data_nasc: formData.dataNascimento,
        senha,
        email: trimmedEmail,
        telefone: trimmedTelefone || null,
        ddd: trimmedDdd || null,
        localidade: {
          estado: trimmedEstado,
          cidade: trimmedCidade,
          bairro: trimmedBairro,
        },
      };

      await axios.post(`${API_BASE_URL}/moradores`, payload);

      setFormData(initialState);
      setSuccessMessage("Cadastro realizado com sucesso.");
      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          typeof error.response?.data === "object" && error.response?.data !== null
            ? (error.response.data as { detail?: string; message?: string }).detail ??
              (error.response.data as { detail?: string; message?: string }).message
            : undefined;
        setErrorMessage(backendMessage ?? "Não foi possível concluir o cadastro.");
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Erro inesperado. Tente novamente em instantes.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertPopup message={errorMessage} type="error" onClose={() => setErrorMessage("")} />
      <AlertPopup message={successMessage} type="success" onClose={() => setSuccessMessage("")} />
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-semibold text-neutral-800">
            Nome completo
          </label>
          <input
            id="nome"
            type="text"
            value={formData.nome}
            onChange={handleInputChange("nome")}
            placeholder="Seu nome completo"
            className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-neutral-800">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="seu.email@dominio.com"
            className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="cpf" className="text-sm font-semibold text-neutral-800">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            value={formData.cpf}
            onChange={handleInputChange("cpf")}
            placeholder="000.000.000-00"
            maxLength={14}
            className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="dataNascimento" className="text-sm font-semibold text-neutral-800">
            Data de nascimento
          </label>
          <DateInput
            id="dataNascimento"
            value={formData.dataNascimento}
            onChange={(value) => setFormData((prev) => ({ ...prev, dataNascimento: value }))}
            required
            disabled={isLoading}
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
              value={formData.senha}
              onChange={handleInputChange("senha")}
              placeholder="Crie uma senha segura"
              className="w-full rounded-full border border-neutral-300 px-4 py-3 pr-12 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
              required
              disabled={isLoading}
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
          <label htmlFor="endereco" className="text-sm font-semibold text-neutral-800">
            Endereço
          </label>
          <input
            id="endereco"
            type="text"
            value={formData.endereco}
            onChange={handleInputChange("endereco")}
            placeholder="Rua Exemplo, 123"
            className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
            required
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="estado" className="text-sm font-semibold text-neutral-800">
              Estado
            </label>
            <input
              id="estado"
              type="text"
              value={formData.estado}
              onChange={handleInputChange("estado")}
              placeholder="Distrito Federal"
              className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cidade" className="text-sm font-semibold text-neutral-800">
              Cidade
            </label>
            <input
              id="cidade"
              type="text"
              value={formData.cidade}
              onChange={handleInputChange("cidade")}
              placeholder="Brasília"
              className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bairro" className="text-sm font-semibold text-neutral-800">
              Bairro
            </label>
            <input
              id="bairro"
              type="text"
              value={formData.bairro}
              onChange={handleInputChange("bairro")}
              placeholder="Asa Norte"
              className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="ddd" className="text-sm font-semibold text-neutral-800">
              DDD
            </label>
            <input
              id="ddd"
              type="text"
              value={formData.ddd}
              onChange={handleInputChange("ddd")}
              placeholder="61"
              inputMode="numeric"
              maxLength={3}
              className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="telefone" className="text-sm font-semibold text-neutral-800">
              Telefone
            </label>
            <input
              id="telefone"
              type="tel"
              value={formData.telefone}
              onChange={handleInputChange("telefone")}
              placeholder="999999999"
              inputMode="tel"
              className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full rounded-full border border-lime-500 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-lime-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Cadastrar"}
        </button>
      </form>
    </>
  );
};

export default CadastroForm;

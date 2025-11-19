"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";

type TipoOcorrencia = {
	cod_tipo: number;
	nome: string;
};

type FormState = {
	tipoOcorrencia: string;
	estado: string;
	municipio: string;
	bairro: string;
	endereco: string;
	data: string;
	descricao: string;
};

const initialFormState: FormState = {
	tipoOcorrencia: "",
	estado: "",
	municipio: "",
	bairro: "",
	endereco: "",
	data: "",
	descricao: "",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const CadastrarOcorrenciaPage = () => {
	const { email: loggedEmail } = useUser();
	const [formData, setFormData] = useState<FormState>(initialFormState);
	const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
	const [isLoadingTipos, setIsLoadingTipos] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		const controller = new AbortController();

		const fetchTipos = async () => {
			setIsLoadingTipos(true);
			setErrorMessage("");

			try {
				const response = await axios.get<TipoOcorrencia[]>(`${API_BASE_URL}/tipos-ocorrencia`, {
					signal: controller.signal,
				});
				setTipos(response.data ?? []);
			} catch (error) {
				if (!controller.signal.aborted) {
					if (axios.isAxiosError(error)) {
						setErrorMessage(
							error.response?.data?.message ?? "Não foi possível carregar os tipos de ocorrência."
						);
					} else {
						setErrorMessage("Erro inesperado ao carregar dados.");
					}
				}
			}
			setIsLoadingTipos(false);
		};

		fetchTipos();

		return () => controller.abort();
	}, []);

	const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData((prev) => ({ ...prev, [field]: event.target.value }));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!loggedEmail) {
			setErrorMessage("Faça login para registrar uma ocorrência.");
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.post(`${API_BASE_URL}/ocorrencias`, {
				tipoOcorrencia: Number(formData.tipoOcorrencia),
				estado: formData.estado,
				municipio: formData.municipio,
				bairro: formData.bairro,
				endereco: formData.endereco,
				data: formData.data,
				descricao: formData.descricao,
				email: loggedEmail,
			});
			setSuccessMessage("Ocorrência cadastrada com sucesso.");
			setFormData(initialFormState);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível cadastrar a ocorrência.");
			} else {
				setErrorMessage("Erro inesperado ao salvar dados.");
			}
		}
		setIsSaving(false);
	};

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar
					links={[
						{ href: "/ocorrencias/cadastrar", label: "Cadastrar Ocorrência" },
						{ href: "/ocorrencias/listar", label: "Listar Ocorrências" },
						{ href: "/ocorrencias/editar", label: "Editar Ocorrência" },
						{ href: "/ocorrencias/deletar", label: "Deletar Ocorrência" },
					]}
				/>
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-4xl space-y-10">
						<div className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">
								Cadastrar ocorrência
							</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Informe os dados da ocorrência para registrá-la junto ao órgão responsável. Campos com * são obrigatórios.
							</p>
						</div>
						<div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
							<form className="space-y-6" onSubmit={handleSubmit}>
								<div className="space-y-2">
									<label htmlFor="tipoOcorrencia" className="text-sm font-semibold text-neutral-800">
										Tipo de ocorrência*
									</label>
									<select
										id="tipoOcorrencia"
										value={formData.tipoOcorrencia}
										onChange={handleChange("tipoOcorrencia")}
										className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
										disabled={isLoadingTipos || isSaving}
										required
									>
										<option value="" disabled>
											Selecione uma opção
										</option>
										{tipos.map((tipo) => (
											<option key={tipo.cod_tipo} value={tipo.cod_tipo}>
												{tipo.nome}
											</option>
										))}
									</select>
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label htmlFor="estado" className="text-sm font-semibold text-neutral-800">
											Estado*
										</label>
										<input
											id="estado"
											type="text"
											value={formData.estado}
											onChange={handleChange("estado")}
											placeholder="Distrito Federal"
											className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
											required
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor="municipio" className="text-sm font-semibold text-neutral-800">
											Município*
										</label>
										<input
											id="municipio"
											type="text"
											value={formData.municipio}
											onChange={handleChange("municipio")}
											placeholder="Brasília"
											className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
											required
										/>
									</div>
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label htmlFor="bairro" className="text-sm font-semibold text-neutral-800">
											Bairro*
										</label>
										<input
											id="bairro"
											type="text"
											value={formData.bairro}
											onChange={handleChange("bairro")}
											placeholder="Asa Norte"
											className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
											required
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor="endereco" className="text-sm font-semibold text-neutral-800">
											Endereço*
										</label>
										<input
											id="endereco"
											type="text"
											value={formData.endereco}
											onChange={handleChange("endereco")}
											placeholder="SQN 312, Bloco B"
											className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
											required
										/>
									</div>
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label htmlFor="data" className="text-sm font-semibold text-neutral-800">
											Data da ocorrência*
										</label>
										<input
											id="data"
											type="date"
											value={formData.data}
											onChange={handleChange("data")}
											className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
											required
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor="descricao" className="text-sm font-semibold text-neutral-800">
											Descrição
										</label>
										<textarea
											id="descricao"
											value={formData.descricao}
											onChange={handleChange("descricao")}
											placeholder="Forneça detalhes adicionais da ocorrência."
											className="h-32 w-full rounded-3xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
										/>
									</div>
								</div>

								{errorMessage && (
									<p className="text-sm text-red-500">{errorMessage}</p>
								)}
								{successMessage && (
									<p className="text-sm text-lime-600">{successMessage}</p>
								)}

								<button
									type="submit"
									disabled={isSaving || isLoadingTipos}
									className="w-full rounded-full border border-lime-500 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-lime-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isSaving ? "Salvando..." : "Registrar ocorrência"}
								</button>
							</form>
						</div>
					</div>
				</main>
				<AppFooter />
			</div>
		</div>
	);
};

export default CadastrarOcorrenciaPage;

"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";

type MoradorFormState = {
	email: string;
	endereco: string;
	cpf: string;
	dataNascimento: string;
};

const initialFormState: MoradorFormState = {
	email: "",
	endereco: "",
	cpf: "",
	dataNascimento: "",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const links = [
	{ href: "/informacoes", label: "Minhas informações" },
	{ href: "/ocorrencias", label: "Ocorrências" },
];

const InformacoesPage = () => {
	const { email: loggedEmail } = useUser();
	const [formData, setFormData] = useState<MoradorFormState>(initialFormState);
	const [isFetching, setIsFetching] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const isReady = useMemo(() => Boolean(loggedEmail), [loggedEmail]);

	useEffect(() => {
		if (!loggedEmail) {
			return;
		}

		const controller = new AbortController();

		const fetchData = async () => {
			setIsFetching(true);
			setErrorMessage("");
			setSuccessMessage("");

			try {
				const response = await axios.get<{ email: string; endereco?: string; cpf?: string; data_nascimento?: string }>(
					`${API_BASE_URL}/moradores/${encodeURIComponent(loggedEmail)}`,
					{ signal: controller.signal }
				);
				const data = response.data;

				setFormData({
					email: data.email ?? loggedEmail,
					endereco: data.endereco ?? "",
					cpf: data.cpf ?? "",
					dataNascimento: data.data_nascimento ?? "",
				});
			} catch (error) {
				if (!controller.signal.aborted) {
					if (axios.isAxiosError(error)) {
						setErrorMessage(error.response?.data?.message ?? "Não foi possível carregar as informações.");
					} else {
						setErrorMessage("Erro inesperado ao carregar dados.");
					}
				}
			} finally {
				setIsFetching(false);
			}
		};

		fetchData();

		return () => {
			controller.abort();
		};
	}, [loggedEmail]);

	const handleChange = (field: keyof MoradorFormState) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target;
			setFormData((prev) => ({ ...prev, [field]: value }));
		};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!loggedEmail) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.put(
				`${API_BASE_URL}/moradores/${encodeURIComponent(loggedEmail)}`,
				{
					endereco: formData.endereco,
					cpf: formData.cpf,
					data_nascimento: formData.dataNascimento,
				}
			);
			setSuccessMessage("Dados atualizados com sucesso.");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível atualizar as informações.");
			} else {
				setErrorMessage("Erro inesperado ao salvar dados.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar links={links} />
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-4xl space-y-10">
						<div className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">
								Minhas informações
							</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Gerencie seus dados pessoais utilizados nas manifestações. Atualize endereço, CPF e data de nascimento sempre que necessário.
							</p>
						</div>

						{!isReady ? (
							<div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-neutral-600 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
								Faça login para visualizar suas informações.
							</div>
						) : (
							<div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
								<form className="space-y-6" onSubmit={handleSubmit}>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<label htmlFor="email" className="text-sm font-semibold text-neutral-800">
												Email
											</label>
											<input
												id="email"
												type="email"
												value={formData.email}
												readOnly
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-500 transition-colors focus:border-neutral-300 focus:outline-none"
											/>
										</div>
										<div className="space-y-2">
											<label htmlFor="cpf" className="text-sm font-semibold text-neutral-800">
												CPF
											</label>
											<input
												id="cpf"
												type="text"
												maxLength={14}
												value={formData.cpf}
												onChange={handleChange("cpf")}
												placeholder="000.000.000-00"
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												disabled={isFetching}
											/>
										</div>
									</div>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<label htmlFor="endereco" className="text-sm font-semibold text-neutral-800">
												Endereço
											</label>
											<input
												id="endereco"
												type="text"
												value={formData.endereco}
												onChange={handleChange("endereco")}
												placeholder="Rua Exemplo, 123"
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												disabled={isFetching}
											/>
										</div>
										<div className="space-y-2">
											<label htmlFor="dataNascimento" className="text-sm font-semibold text-neutral-800">
												Data de nascimento
											</label>
											<input
												id="dataNascimento"
												type="date"
												value={formData.dataNascimento}
												onChange={handleChange("dataNascimento")}
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												disabled={isFetching}
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
										disabled={isFetching || isSaving}
										className="w-full rounded-full border border-lime-500 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-lime-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-70"
									>
										{isSaving ? "Salvando..." : "Salvar alterações"}
									</button>
								</form>
							</div>
						)}
					</div>
				</main>
				<AppFooter />
			</div>
		</div>
	);
};

export default InformacoesPage;

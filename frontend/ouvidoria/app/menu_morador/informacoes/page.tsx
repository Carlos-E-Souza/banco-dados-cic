"use client";

import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import DateInput from "../../../components/DateInput";
import Navbar from "../../../components/Navbar";
import AlertPopup from "../../../components/AlertPopup";
import { useUser } from "../../../components/UserContext";

type MoradorFormState = {
	nome: string;
	email: string;
	cpf: string;
	endereco: string;
	dataNascimento: string;
	telefone: string;
	ddd: string;
	estado: string;
	cidade: string;
	bairro: string;
	senha: string;
};

const initialFormState: MoradorFormState = {
	nome: "",
	email: "",
	cpf: "",
	endereco: "",
	dataNascimento: "",
	telefone: "",
	ddd: "",
	estado: "",
	cidade: "",
	bairro: "",
	senha: "",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const links = [{ href: "/menu_morador", label: "Menu" }];

type MoradorApiResponse = {
	nome?: string | null;
	email?: string | null;
	cpf?: string | null;
	endereco?: string | null;
	data_nasc?: string | null;
	telefone?: string | null;
	ddd?: string | null;
	estado?: string | null;
	cidade?: string | null;
	bairro?: string | null;
};

const InformacoesPage = () => {
	const { email: loggedEmail, cpf: loggedCpf, setCpf, setEmail } = useUser();
	const [formData, setFormData] = useState<MoradorFormState>(initialFormState);
	const [isFetching, setIsFetching] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const cpfForRequest = useMemo(() => (loggedCpf ? loggedCpf.replace(/\D/g, "") : ""), [loggedCpf]);
	const isReady = useMemo(() => Boolean(cpfForRequest), [cpfForRequest]);

	useEffect(() => {
		if (!cpfForRequest) {
			return;
		}

		const controller = new AbortController();

		const fetchData = async () => {
			setIsFetching(true);
			setErrorMessage("");
			setSuccessMessage("");

			try {
				const response = await axios.get<MoradorApiResponse>(
					`${API_BASE_URL}/moradores/cpf/${encodeURIComponent(cpfForRequest)}`,
					{ signal: controller.signal }
				);
				const data = response.data;

				const nextForm: MoradorFormState = {
					nome: (data.nome ?? "").trim(),
					email: (data.email ?? loggedEmail ?? "").trim(),
					cpf: (data.cpf ?? cpfForRequest).trim(),
					endereco: (data.endereco ?? "").trim(),
					dataNascimento: data.data_nasc ?? "",
					telefone: (data.telefone ?? "").trim(),
					ddd: (data.ddd ?? "").trim(),
					estado: (data.estado ?? "").trim(),
					cidade: (data.cidade ?? "").trim(),
					bairro: (data.bairro ?? "").trim(),
					senha: "",
				};

				setFormData(nextForm);

				if (nextForm.cpf) {
					setCpf(nextForm.cpf);
				}

				if (nextForm.email) {
					setEmail(nextForm.email);
				}
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
	}, [cpfForRequest, loggedEmail, setCpf, setEmail]);

	const handleChange = (field: keyof MoradorFormState) =>
		(event: ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target;
			setFormData((prev) => ({ ...prev, [field]: value }));
		};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setErrorMessage("");
		setSuccessMessage("");

		if (!cpfForRequest) {
			setErrorMessage("CPF não encontrado. Faça login novamente.");
			return;
		}

		const trimmedNome = formData.nome.trim();
		const trimmedEmail = formData.email.trim();
		const trimmedEndereco = formData.endereco.trim();
		const trimmedTelefone = formData.telefone.trim();
		const trimmedDdd = formData.ddd.trim();
		const trimmedEstado = formData.estado.trim();
		const trimmedCidade = formData.cidade.trim();
		const trimmedBairro = formData.bairro.trim();
		const newPassword = formData.senha.trim();
		const hasLocalidadeFields = Boolean(trimmedEstado || trimmedCidade || trimmedBairro);

		if (!trimmedNome) {
			setErrorMessage("Informe o nome do morador.");
			return;
		}

		if (!trimmedEmail) {
			setErrorMessage("Informe um email válido.");
			return;
		}

		if (hasLocalidadeFields && !(trimmedEstado && trimmedCidade && trimmedBairro)) {
			setErrorMessage("Informe estado, cidade e bairro para atualizar a localidade.");
			return;
		}

		setIsSaving(true);

		try {
			const payload: Record<string, unknown> = {
				nome: trimmedNome,
				endereco: trimmedEndereco,
				data_nasc: formData.dataNascimento || null,
				email: trimmedEmail,
				telefone: trimmedTelefone || null,
				ddd: trimmedDdd || null,
			};

			if (hasLocalidadeFields) {
				payload.localidade = {
					estado: trimmedEstado,
					cidade: trimmedCidade,
					bairro: trimmedBairro,
				};
			}

			if (newPassword) {
				payload.senha = newPassword;
			}

			await axios.put(
				`${API_BASE_URL}/moradores/${encodeURIComponent(cpfForRequest)}`,
				payload
			);

			setFormData((prev) => ({
				...prev,
				nome: trimmedNome,
				email: trimmedEmail,
				endereco: trimmedEndereco,
				telefone: trimmedTelefone,
				ddd: trimmedDdd,
				estado: trimmedEstado,
				cidade: trimmedCidade,
				bairro: trimmedBairro,
				senha: "",
			}));

			setEmail(trimmedEmail);
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
					<AlertPopup message={errorMessage} type="error" onClose={() => setErrorMessage("")} />
					<AlertPopup message={successMessage} type="success" onClose={() => setSuccessMessage("")} />
					<div className="w-full max-w-4xl space-y-10">
						<div className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">Minhas informações</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Gerencie seus dados pessoais utilizados nas manifestações. Atualize seus dados sempre que necessário.
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
											<label htmlFor="nome" className="text-sm font-semibold text-neutral-800">
												Nome
											</label>
											<input
												id="nome"
												type="text"
												value={formData.nome}
												onChange={handleChange("nome")}
												placeholder="Nome completo"
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												required
												disabled={isFetching || isSaving}
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
												onChange={handleChange("email")}
												placeholder="seu.email@dominio.com"
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												required
												disabled={isFetching || isSaving}
											/>
										</div>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<label htmlFor="cpf" className="text-sm font-semibold text-neutral-800">
												CPF
											</label>
											<input
												id="cpf"
												type="text"
												value={formData.cpf}
												readOnly
												className="w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500"
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
												disabled={isFetching || isSaving}
											/>
										</div>
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
												onChange={handleChange("estado")}
												placeholder="UF"
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												disabled={isFetching || isSaving}
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
												onChange={handleChange("cidade")}
												placeholder="Brasília"
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												disabled={isFetching || isSaving}
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
												onChange={handleChange("bairro")}
												placeholder="Asa Norte"
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
												disabled={isFetching || isSaving}
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
												onChange={handleChange("telefone")}
												placeholder="(61) 99999-9999"
												inputMode="tel"
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												disabled={isFetching || isSaving}
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
												onChange={handleChange("ddd")}
												placeholder="61"
												inputMode="numeric"
												maxLength={3}
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												disabled={isFetching || isSaving}
											/>
										</div>
										<div className="space-y-2">
											<label htmlFor="senha" className="text-sm font-semibold text-neutral-800">
												Nova senha
											</label>
											<input
												id="senha"
												type="password"
												value={formData.senha}
												onChange={handleChange("senha")}
												placeholder="Deixe em branco para manter a atual"
												className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
												disabled={isFetching || isSaving}
											/>
										</div>
									</div>

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

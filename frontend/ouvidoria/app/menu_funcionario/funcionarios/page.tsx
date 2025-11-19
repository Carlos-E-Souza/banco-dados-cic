"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";
import CreateFuncionarioModal from "../../../components/funcionarios/CreateFuncionarioModal";
import DeleteFuncionarioModal from "../../../components/funcionarios/DeleteFuncionarioModal";
import EditFuncionarioModal from "../../../components/funcionarios/EditFuncionarioModal";
import {
	Cargo,
	Funcionario,
	FuncionarioFormState,
	OrgaoPublico,
} from "../../../components/funcionarios/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const mockFuncionarios: Funcionario[] = [
	{
		cpf: "12345678900",
		nome: "Maria Ferreira",
		orgao_pub: 1,
		orgao_nome: "Secretaria de Obras",
		cargo: 1,
		cargo_nome: "Engenheira",
		data_nasc: "1988-03-15",
		inicio_contrato: "2020-01-10",
		fim_contrato: "2025-01-09",
	},
	{
		cpf: "98765432100",
		nome: "João Lima",
		orgao_pub: 2,
		orgao_nome: "Secretaria de Educação",
		cargo: 2,
		cargo_nome: "Coordenador",
		data_nasc: "1990-07-22",
		inicio_contrato: "2019-08-01",
		fim_contrato: null,
	},
	{
		cpf: "45678912300",
		nome: "Ana Souza",
		orgao_pub: 3,
		orgao_nome: "Secretaria de Saúde",
		cargo: 3,
		cargo_nome: "Analista",
		data_nasc: "1995-11-04",
		inicio_contrato: "2022-05-12",
		fim_contrato: "2024-05-11",
	},
];

const mockCargos: Cargo[] = [
	{ cod_cargo: 1, nome: "Engenheira" },
	{ cod_cargo: 2, nome: "Coordenador" },
	{ cod_cargo: 3, nome: "Analista" },
];

const mockOrgaos: OrgaoPublico[] = [
	{ cod_orgao: 1, nome: "Secretaria de Obras", estado: "DF" },
	{ cod_orgao: 2, nome: "Secretaria de Educação", estado: "DF" },
	{ cod_orgao: 3, nome: "Secretaria de Saúde", estado: "DF" },
];

const emptyForm: FuncionarioFormState = {
	cpf: "",
	nome: "",
	orgaoPub: "",
	cargo: "",
	dataNasc: "",
	inicioContrato: "",
	fimContrato: "",
};

const funcionarioLinks = [
	{ href: "/menu_funcionario", label: "Menu" },
	{ href: "/menu_funcionario/funcionarios", label: "Funcionários" },
];

const FuncionariosPage = () => {
	const { isFuncionario } = useUser();
	const [funcionarios, setFuncionarios] = useState<Funcionario[]>(mockFuncionarios);
	const [cargos, setCargos] = useState<Cargo[]>(mockCargos);
	const [orgaos, setOrgaos] = useState<OrgaoPublico[]>(mockOrgaos);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
	const [deleteCandidate, setDeleteCandidate] = useState<Funcionario | null>(null);
	const [formState, setFormState] = useState<FuncionarioFormState>(emptyForm);
	const [createFormState, setCreateFormState] = useState<FuncionarioFormState>(emptyForm);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const [funcResponse, cargoResponse, orgaoResponse] = await Promise.all([
					axios.get<Funcionario[]>(`${API_BASE_URL}/funcionarios`, { signal: controller.signal }),
					axios.get<Cargo[]>(`${API_BASE_URL}/cargos`, { signal: controller.signal }),
					axios.get<OrgaoPublico[]>(`${API_BASE_URL}/orgaos-publicos`, { signal: controller.signal }),
				]);

				const funcionariosData = funcResponse.data?.length ? funcResponse.data : mockFuncionarios;
				setFuncionarios(
					funcionariosData.map((item) => ({
						...item,
						data_nasc: item.data_nasc ?? "",
						inicio_contrato: item.inicio_contrato ?? "",
						fim_contrato: item.fim_contrato ?? null,
					}))
				);
				setCargos(cargoResponse.data?.length ? cargoResponse.data : mockCargos);
				setOrgaos(orgaoResponse.data?.length ? orgaoResponse.data : mockOrgaos);
			} catch (error) {
				if (!controller.signal.aborted) {
					if (axios.isAxiosError(error)) {
						setErrorMessage(error.response?.data?.message ?? "Não foi possível carregar os funcionários.");
					} else {
						setErrorMessage("Erro inesperado ao carregar dados.");
					}
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();

		return () => controller.abort();
	}, []);

	const filteredFuncionarios = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) {
			return funcionarios;
		}
		return funcionarios.filter((func) => func.nome.toLowerCase().includes(term));
	}, [funcionarios, searchTerm]);

	const handleFieldChange = (field: keyof FuncionarioFormState, value: string) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	const handleCreateFieldChange = (field: keyof FuncionarioFormState, value: string) => {
		setCreateFormState((prev) => ({ ...prev, [field]: value }));
	};

	const openCreateModal = () => {
		setIsCreateModalOpen(true);
		setCreateFormState(emptyForm);
		setErrorMessage("");
		setSuccessMessage("");
	};

	const closeCreateModal = () => {
		setIsCreateModalOpen(false);
		setCreateFormState(emptyForm);
	};

	const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			cpf: createFormState.cpf,
			nome: createFormState.nome,
			orgao_pub: Number(createFormState.orgaoPub),
			cargo: Number(createFormState.cargo),
			data_nasc: createFormState.dataNasc,
			inicio_contrato: createFormState.inicioContrato,
			fim_contrato: createFormState.fimContrato ? createFormState.fimContrato : null,
		};

		const orgaoNome =
			orgaos.find((item) => String(item.cod_orgao) === createFormState.orgaoPub)?.nome ?? "";
		const cargoNome =
			cargos.find((item) => String(item.cod_cargo) === createFormState.cargo)?.nome ?? "";

		try {
			const response = await axios.post<Funcionario>(`${API_BASE_URL}/funcionarios`, payload);
			const responseData = response.data;

			setFuncionarios((prev) => {
				const newItem = responseData
					? {
						...responseData,
						orgao_nome: responseData.orgao_nome ?? orgaoNome,
						cargo_nome: responseData.cargo_nome ?? cargoNome,
						fim_contrato: responseData.fim_contrato ?? null,
					}
					: {
						cpf: createFormState.cpf,
						nome: createFormState.nome,
						orgao_pub: Number(createFormState.orgaoPub),
						orgao_nome: orgaoNome,
						cargo: Number(createFormState.cargo),
						cargo_nome: cargoNome,
						data_nasc: createFormState.dataNasc,
						inicio_contrato: createFormState.inicioContrato,
						fim_contrato: createFormState.fimContrato || null,
					};

				return [...prev, newItem];
			});

			setSuccessMessage("Funcionário cadastrado com sucesso.");
			closeCreateModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível cadastrar o funcionário.");
			} else {
				setErrorMessage("Erro inesperado ao cadastrar funcionário.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const openEditModal = (funcionario: Funcionario) => {
		setEditingFuncionario(funcionario);
		setFormState({
			cpf: funcionario.cpf,
			nome: funcionario.nome,
			orgaoPub: String(funcionario.orgao_pub),
			cargo: String(funcionario.cargo),
			dataNasc: funcionario.data_nasc?.slice(0, 10) ?? "",
			inicioContrato: funcionario.inicio_contrato?.slice(0, 10) ?? "",
			fimContrato: funcionario.fim_contrato?.slice(0, 10) ?? "",
		});
		setErrorMessage("");
		setSuccessMessage("");
	};

	const closeEditModal = () => {
		setEditingFuncionario(null);
		setFormState(emptyForm);
	};

	const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingFuncionario) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.put(`${API_BASE_URL}/funcionarios/${editingFuncionario.cpf}`, {
				nome: formState.nome,
				orgao_pub: Number(formState.orgaoPub),
				cargo: Number(formState.cargo),
				data_nasc: formState.dataNasc,
				inicio_contrato: formState.inicioContrato,
				fim_contrato: formState.fimContrato ? formState.fimContrato : null,
			});

			const orgaoNome = orgaos.find((item) => String(item.cod_orgao) === formState.orgaoPub)?.nome ?? editingFuncionario.orgao_nome;
			const cargoNome = cargos.find((item) => String(item.cod_cargo) === formState.cargo)?.nome ?? editingFuncionario.cargo_nome;

			setFuncionarios((prev) =>
				prev.map((item) =>
					item.cpf === editingFuncionario.cpf
						? {
							...item,
							nome: formState.nome,
							orgao_pub: Number(formState.orgaoPub),
							orgao_nome: orgaoNome,
							cargo: Number(formState.cargo),
							cargo_nome: cargoNome,
							data_nasc: formState.dataNasc,
							inicio_contrato: formState.inicioContrato,
							fim_contrato: formState.fimContrato || null,
						}
						: item
				)
			);

			setSuccessMessage("Funcionário atualizado com sucesso.");
			closeEditModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível atualizar o funcionário.");
			} else {
				setErrorMessage("Erro inesperado ao atualizar funcionário.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const requestDeleteFuncionario = (funcionario: Funcionario) => {
		setDeleteCandidate(funcionario);
		setErrorMessage("");
		setSuccessMessage("");
	};

	const handleDelete = async () => {
		if (!deleteCandidate) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.delete(`${API_BASE_URL}/funcionarios/${deleteCandidate.cpf}`);
			setFuncionarios((prev) => prev.filter((item) => item.cpf !== deleteCandidate.cpf));
			setSuccessMessage("Funcionário removido com sucesso.");
			setDeleteCandidate(null);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível excluir o funcionário.");
			} else {
				setErrorMessage("Erro inesperado ao excluir funcionário.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const pageLinks = isFuncionario ? funcionarioLinks : undefined;

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar links={pageLinks} />
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-6xl space-y-10">
						<header className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">Funcionários cadastrados</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Gerencie os colaboradores vinculados ao sistema. Utilize o filtro para encontrar rapidamente um nome específico.
							</p>
						</header>
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<label className="relative w-full max-w-md">
								<input
									type="text"
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
									placeholder="Filtrar por nome"
									className="w-full rounded-full border border-neutral-300 px-5 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								/>
								<span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
										<path d="m19 19-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
									</svg>
								</span>
							</label>
							<button
								type="button"
								onClick={openCreateModal}
								className="flex w-full items-center justify-center gap-2 rounded-full border border-lime-500 bg-lime-500 px-5 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-lime-400 md:w-auto"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-4 w-4"
								>
									<path d="M12 6v12" strokeLinecap="round" />
									<path d="M18 12H6" strokeLinecap="round" />
								</svg>
								<span>Adicionar funcionário</span>
							</button>
						</div>
						{errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
						{successMessage && <p className="text-sm text-lime-600">{successMessage}</p>}
						<div className="overflow-hidden rounded-3xl border border-neutral-200 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
							<table className="min-w-full divide-y divide-neutral-200 text-sm">
								<thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
									<tr>
										<th className="px-6 py-4 text-left">Nome</th>
										<th className="px-6 py-4 text-left">Órgão público</th>
										<th className="px-6 py-4 text-left">Cargo</th>
										<th className="px-6 py-4 text-right">Ações</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-neutral-200 bg-white">
									{isLoading ? (
										<tr>
											<td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
												Carregando funcionários...
											</td>
										</tr>
									) : filteredFuncionarios.length === 0 ? (
										<tr>
											<td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
												Nenhum funcionário encontrado.
											</td>
										</tr>
									) : (
										filteredFuncionarios.map((funcionario) => (
											<tr key={funcionario.cpf} className="transition-colors hover:bg-neutral-50">
												<td className="px-6 py-4 text-neutral-800">{funcionario.nome}</td>
												<td className="px-6 py-4 text-neutral-600">{funcionario.orgao_nome}</td>
												<td className="px-6 py-4 text-neutral-600">{funcionario.cargo_nome}</td>
												<td className="px-6 py-4">
													<div className="flex items-center justify-end gap-3">
														<button
															type="button"
															onClick={() => openEditModal(funcionario)}
															className="rounded-full border border-neutral-300 p-2 text-neutral-600 transition-colors hover:border-lime-500 hover:text-lime-600"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="1.5"
																className="h-4 w-4"
															>
																<path d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97l-9.05 9.05a4 4 0 0 1-1.69 1.01l-3.38.99.99-3.38a4 4 0 0 1 1.01-1.69l9.15-9.15Z" />
																<path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
															</svg>
														</button>
														<button
															type="button"
															onClick={() => requestDeleteFuncionario(funcionario)}
															className="rounded-full border border-red-200 p-2 text-red-500 transition-colors hover:border-red-400 hover:text-red-600"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="1.5"
																className="h-4 w-4"
															>
																<path d="M6 7h12" strokeLinecap="round" />
																<path d="M10 11v6" strokeLinecap="round" />
																<path d="M14 11v6" strokeLinecap="round" />
																<path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
																<path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" strokeLinecap="round" strokeLinejoin="round" />
															</svg>
														</button>
													</div>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</main>
				<AppFooter />
			</div>
			<CreateFuncionarioModal
				isOpen={isCreateModalOpen}
				cargos={cargos}
				orgaos={orgaos}
				formState={createFormState}
				isSaving={isSaving}
				onClose={closeCreateModal}
				onSubmit={handleCreateSubmit}
				onChange={handleCreateFieldChange}
			/>
			<EditFuncionarioModal
				funcionario={editingFuncionario}
				cargos={cargos}
				orgaos={orgaos}
				formState={formState}
				isSaving={isSaving}
				onClose={closeEditModal}
				onSubmit={handleEditSubmit}
				onChange={handleFieldChange}
			/>
			<DeleteFuncionarioModal
				funcionario={deleteCandidate}
				isSaving={isSaving}
				onCancel={() => setDeleteCandidate(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
};

export default FuncionariosPage;

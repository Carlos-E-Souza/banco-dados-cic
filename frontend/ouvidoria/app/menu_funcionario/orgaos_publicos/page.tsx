"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";
import CreateOrgaoPublicoModal from "../../../components/orgaosPublicos/CreateOrgaoPublicoModal";
import DeleteOrgaoPublicoModal from "../../../components/orgaosPublicos/DeleteOrgaoPublicoModal";
import EditOrgaoPublicoModal from "../../../components/orgaosPublicos/EditOrgaoPublicoModal";
import AlertPopup from "../../../components/AlertPopup";
import { OrgaoPublico } from "../../../components/funcionarios/types";
import { OrgaoPublicoFormState } from "../../../components/orgaosPublicos/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const emptyForm: OrgaoPublicoFormState = {
	nome: "",
	estado: "",
	descricao: "",
	dataInicio: "",
	dataFim: "",
};

const funcionarioLinks = [
	{ href: "/menu_funcionario", label: "Menu" },
];

const OrgaosPublicosPage = () => {
	const { isFuncionario } = useUser();
	const [orgaos, setOrgaos] = useState<OrgaoPublico[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingOrgao, setEditingOrgao] = useState<OrgaoPublico | null>(null);
	const [deleteCandidate, setDeleteCandidate] = useState<OrgaoPublico | null>(null);
	const [formState, setFormState] = useState<OrgaoPublicoFormState>(emptyForm);
	const [createFormState, setCreateFormState] = useState<OrgaoPublicoFormState>(emptyForm);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const response = await axios.get<OrgaoPublico[]>(`${API_BASE_URL}/orgaos-publicos`, {
					signal: controller.signal,
				});
				setOrgaos(
					(response.data ?? []).map((item) => ({
						...item,
						data_ini: item.data_ini ?? "",
						data_fim: item.data_fim ?? null,
					}))
				);
			} catch (error) {
				if (!controller.signal.aborted) {
					if (axios.isAxiosError(error)) {
						setErrorMessage(error.response?.data?.message ?? "Não foi possível carregar os órgãos públicos.");
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

	const filteredOrgaos = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) {
			return orgaos;
		}
		return orgaos.filter((orgao) => orgao.nome.toLowerCase().includes(term));
	}, [orgaos, searchTerm]);

	const handleFieldChange = (field: keyof OrgaoPublicoFormState, value: string) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	const handleCreateFieldChange = (field: keyof OrgaoPublicoFormState, value: string) => {
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

	const openEditModal = (orgao: OrgaoPublico) => {
		setEditingOrgao(orgao);
		setFormState({
			nome: orgao.nome,
			estado: orgao.estado,
			descricao: orgao.descr ?? "",
			dataInicio: orgao.data_ini?.slice(0, 10) ?? "",
			dataFim: orgao.data_fim?.slice(0, 10) ?? "",
		});
		setErrorMessage("");
		setSuccessMessage("");
	};

	const closeEditModal = () => {
		setEditingOrgao(null);
		setFormState(emptyForm);
	};

	const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		const nome = createFormState.nome.trim();
		const estado = createFormState.estado.trim();
		const descricao = createFormState.descricao.trim();
		const dataInicio = createFormState.dataInicio;
		const dataFim = createFormState.dataFim ? createFormState.dataFim : null;

		const payload = {
			nome,
			estado,
			descr: descricao || null,
			data_ini: dataInicio,
			data_fim: dataFim,
		};

		try {
			const response = await axios.post<OrgaoPublico>(`${API_BASE_URL}/orgaos-publicos`, payload);
			const responseData = response.data;

			setOrgaos((prev) => [
				...prev,
				{
					...responseData,
					data_ini: responseData.data_ini ?? dataInicio,
					data_fim: responseData.data_fim ?? dataFim,
					descr: responseData.descr ?? (descricao || null),
				},
			]);

			setSuccessMessage("Órgão público adicionado com sucesso.");
			closeCreateModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível cadastrar o órgão público.");
			} else {
				setErrorMessage("Erro inesperado ao cadastrar órgão público.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingOrgao) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			const nome = formState.nome.trim();
			const estado = formState.estado.trim();
			const descricao = formState.descricao.trim();
			const dataInicio = formState.dataInicio;
			const dataFim = formState.dataFim ? formState.dataFim : null;

			const response = await axios.put<OrgaoPublico>(
				`${API_BASE_URL}/orgaos-publicos/${editingOrgao.cod_orgao}`,
				{
					nome,
					estado,
					descr: descricao || null,
					data_ini: dataInicio,
					data_fim: dataFim,
				}
			);
			const responseData = response.data;

			setOrgaos((prev) =>
				prev.map((item) =>
					item.cod_orgao === editingOrgao.cod_orgao
						? {
							...item,
							nome: responseData?.nome ?? nome,
							estado: responseData?.estado ?? estado,
							descr: responseData?.descr ?? (descricao || null),
							data_ini: responseData?.data_ini ?? dataInicio,
							data_fim: responseData?.data_fim ?? dataFim,
					  }
						: item
				)
			);
			setSuccessMessage("Órgão público atualizado com sucesso.");
			closeEditModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível atualizar o órgão público.");
			} else {
				setErrorMessage("Erro inesperado ao atualizar órgão público.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const requestDeleteOrgao = (orgao: OrgaoPublico) => {
		setDeleteCandidate(orgao);
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
			await axios.delete(`${API_BASE_URL}/orgaos-publicos/${deleteCandidate.cod_orgao}`);
			setOrgaos((prev) => prev.filter((item) => item.cod_orgao !== deleteCandidate.cod_orgao));
			setSuccessMessage("Órgão público removido com sucesso.");
			setDeleteCandidate(null);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível excluir o órgão público.");
			} else {
				setErrorMessage("Erro inesperado ao excluir órgão público.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const pageLinks = isFuncionario ? funcionarioLinks : undefined;

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				{errorMessage && (
					<AlertPopup type="error" message={errorMessage} onClose={() => setErrorMessage("")} />
				)}
				{successMessage && (
					<AlertPopup type="success" message={successMessage} onClose={() => setSuccessMessage("")} />
				)}
				<Navbar links={pageLinks} />
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-6xl space-y-10">
						<header className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">Órgãos públicos</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Visualize e mantenha os órgãos responsáveis por gerir os serviços e ocorrências.
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
								<span>Adicionar órgão</span>
							</button>
						</div>
						<div className="overflow-hidden rounded-3xl border border-neutral-200 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
							<table className="min-w-full divide-y divide-neutral-200 text-sm">
								<thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
									<tr>
										<th className="px-6 py-4 text-left">Nome</th>
										<th className="px-6 py-4 text-left">Estado</th>
										<th className="px-6 py-4 text-left">Período</th>
										<th className="px-6 py-4 text-right">Ações</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-neutral-200 bg-white">
									{isLoading ? (
										<tr>
											<td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
												Carregando órgãos públicos...
											</td>
										</tr>
									) : filteredOrgaos.length === 0 ? (
										<tr>
											<td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
												Nenhum órgão encontrado.
											</td>
										</tr>
									) : (
										filteredOrgaos.map((orgao) => (
											<tr key={orgao.cod_orgao} className="transition-colors hover:bg-neutral-50">
												<td className="px-6 py-4 text-neutral-800">{orgao.nome}</td>
												<td className="px-6 py-4 text-neutral-600">{orgao.estado}</td>
												<td className="px-6 py-4 text-neutral-600">
													{orgao.data_ini ? new Date(orgao.data_ini).toLocaleDateString() : "--"} — {orgao.data_fim ? new Date(orgao.data_fim).toLocaleDateString() : "Ativo"}
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center justify-end gap-3">
														<button
															type="button"
															onClick={() => openEditModal(orgao)}
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
															onClick={() => requestDeleteOrgao(orgao)}
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
		<CreateOrgaoPublicoModal
			isOpen={isCreateModalOpen}
			formState={createFormState}
			isSaving={isSaving}
			onClose={closeCreateModal}
			onSubmit={handleCreateSubmit}
			onChange={handleCreateFieldChange}
		/>
		<EditOrgaoPublicoModal
			orgao={editingOrgao}
			formState={formState}
			isSaving={isSaving}
			onClose={closeEditModal}
			onSubmit={handleEditSubmit}
			onChange={handleFieldChange}
		/>
		<DeleteOrgaoPublicoModal
			orgao={deleteCandidate}
			isSaving={isSaving}
			onCancel={() => setDeleteCandidate(null)}
			onConfirm={handleDelete}
		/>
	</div>
);
}

export default OrgaosPublicosPage;

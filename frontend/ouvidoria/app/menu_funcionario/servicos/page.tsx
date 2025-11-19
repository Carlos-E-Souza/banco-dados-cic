"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";
import { Ocorrencia } from "../../../components/ocorrencias/types";
import { OrgaoPublico } from "../../../components/funcionarios/types";
import CreateServicoModal from "../../../components/servicos/CreateServicoModal";
import DeleteServicoModal from "../../../components/servicos/DeleteServicoModal";
import EditServicoModal from "../../../components/servicos/EditServicoModal";
import RelatedOcorrenciaModal from "../../../components/servicos/RelatedOcorrenciaModal";
import ServicoCard from "../../../components/servicos/ServicoCard";
import {
	CreateServicoFormState,
	EditServicoFormState,
	Servico,
} from "../../../components/servicos/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const mockOcorrencias: Ocorrencia[] = [
	{
		cod_oco: 101,
		cod_tipo: 1,
		tipo_nome: "Buraco na via",
		estado: "DF",
		municipio: "Brasília",
		bairro: "Asa Norte",
		endereco: "SQN 308 Bloco A",
		data: "2024-09-12",
		status: "Em análise",
		descricao: "Buraco profundo próximo à faixa de pedestres causando risco aos moradores.",
	},
	{
		cod_oco: 102,
		cod_tipo: 2,
		tipo_nome: "Iluminação pública",
		estado: "DF",
		municipio: "Brasília",
		bairro: "Asa Sul",
		endereco: "CLS 409",
		data: "2024-09-05",
		status: "Aguardando atendimento",
		descricao: "Poste em frente ao bloco C com lâmpada queimada há mais de duas semanas.",
	},
	{
		cod_oco: 103,
		cod_tipo: 3,
		tipo_nome: "Limpeza urbana",
		estado: "DF",
		municipio: "Brasília",
		bairro: "Lago Norte",
		endereco: "QL 12 Conjunto 5",
		data: "2024-08-28",
		status: "Finalizada",
		descricao: "Solicitação de remoção de entulhos já atendida.",
	},
];

const mockOrgaos: OrgaoPublico[] = [
	{ cod_orgao: 1, nome: "Secretaria de Obras", estado: "DF" },
	{ cod_orgao: 2, nome: "Secretaria de Educação", estado: "DF" },
	{ cod_orgao: 3, nome: "Secretaria de Saúde", estado: "DF" },
];

const mockServicos: Servico[] = [
	{
		cod_servico: 201,
		cod_orgao: 1,
		cod_ocorrencia: 101,
		nome: "Recomposição de asfalto",
		descr: "Equipe de manutenção realizará o reparo do buraco e nivelamento da via.",
		inicio_servico: "2024-09-20",
		fim_servico: null,
		orgao_nome: "Secretaria de Obras",
	},
	{
		cod_servico: 202,
		cod_orgao: 2,
		cod_ocorrencia: 102,
		nome: "Substituição de lâmpada",
		descr: "Manutenção programada para troca da lâmpada queimada.",
		inicio_servico: "2024-09-10",
		fim_servico: "2024-09-12",
		orgao_nome: "Secretaria de Educação",
	},
];

const emptyCreateForm: CreateServicoFormState = {
	nome: "",
	codOrgao: "",
	codOcorrencia: "",
	descricao: "",
	inicioServico: "",
	fimServico: "",
};

const emptyEditForm: EditServicoFormState = {
	nome: "",
	codOrgao: "",
	descricao: "",
	inicioServico: "",
	fimServico: "",
};

const funcionarioLinks = [
	{ href: "/menu_funcionario", label: "Menu" },
	{ href: "/menu_funcionario/servicos", label: "Serviços" },
];

const ServicosPage = () => {
	const { isFuncionario } = useUser();
	const [servicos, setServicos] = useState<Servico[]>(mockServicos);
	const [orgaos, setOrgaos] = useState<OrgaoPublico[]>(mockOrgaos);
	const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(mockOcorrencias);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingServico, setEditingServico] = useState<Servico | null>(null);
	const [deleteCandidate, setDeleteCandidate] = useState<Servico | null>(null);
	const [ocorrenciaDetalhe, setOcorrenciaDetalhe] = useState<Ocorrencia | null>(null);
	const [createForm, setCreateForm] = useState<CreateServicoFormState>(emptyCreateForm);
	const [editForm, setEditForm] = useState<EditServicoFormState>(emptyEditForm);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const [servicosResponse, orgaosResponse, ocorrenciasResponse] = await Promise.all([
					axios.get<Servico[]>(`${API_BASE_URL}/servicos`, { signal: controller.signal }),
					axios.get<OrgaoPublico[]>(`${API_BASE_URL}/orgaos-publicos`, { signal: controller.signal }),
					axios.get<Ocorrencia[]>(`${API_BASE_URL}/ocorrencias`, { signal: controller.signal }),
				]);

				const servicosData = servicosResponse.data?.length ? servicosResponse.data : mockServicos;
				const orgaosData = orgaosResponse.data?.length ? orgaosResponse.data : mockOrgaos;
				const ocorrenciasData = ocorrenciasResponse.data?.length ? ocorrenciasResponse.data : mockOcorrencias;

				setOrgaos(orgaosData);
				setOcorrencias(ocorrenciasData);
				setServicos(
					servicosData.map((servico) => {
						const codOcorrencia = (servico as Servico & { cod_ocorre?: number }).cod_ocorrencia ?? (servico as Servico & { cod_ocorre?: number }).cod_ocorre ?? servico.cod_ocorrencia;
						const orgaoNome = orgaosData.find((orgao) => orgao.cod_orgao === servico.cod_orgao)?.nome ?? servico.orgao_nome ?? "";
						return {
							...servico,
							cod_ocorrencia: codOcorrencia,
							orgao_nome: orgaoNome,
						};
					})
				);
			} catch (error) {
				if (!controller.signal.aborted) {
					if (axios.isAxiosError(error)) {
						setErrorMessage(error.response?.data?.message ?? "Não foi possível carregar os serviços.");
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

	const filteredServicos = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) {
			return servicos;
		}
		return servicos.filter((servico) => servico.nome.toLowerCase().includes(term));
	}, [servicos, searchTerm]);

	const handleCreateFieldChange = (field: keyof CreateServicoFormState, value: string) => {
		setCreateForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleEditFieldChange = (field: keyof EditServicoFormState, value: string) => {
		setEditForm((prev) => ({ ...prev, [field]: value }));
	};

	const openCreateModal = () => {
		setIsCreateModalOpen(true);
		setCreateForm(emptyCreateForm);
		setErrorMessage("");
		setSuccessMessage("");
	};

	const closeCreateModal = () => {
		setIsCreateModalOpen(false);
		setCreateForm(emptyCreateForm);
	};

	const openEditModal = (servico: Servico) => {
		setEditingServico(servico);
		setEditForm({
			nome: servico.nome,
			codOrgao: String(servico.cod_orgao),
			descricao: servico.descr ?? "",
			inicioServico: servico.inicio_servico?.slice(0, 10) ?? "",
			fimServico: servico.fim_servico?.slice(0, 10) ?? "",
		});
		setErrorMessage("");
		setSuccessMessage("");
	};

	const closeEditModal = () => {
		setEditingServico(null);
		setEditForm(emptyEditForm);
	};

	const requestDeleteServico = (servico: Servico) => {
		setDeleteCandidate(servico);
		setErrorMessage("");
		setSuccessMessage("");
	};

	const closeDeleteModal = () => {
		setDeleteCandidate(null);
	};

	const openOcorrenciaModal = (servico: Servico) => {
		const ocorrenciaRelacionada = ocorrencias.find((item) => item.cod_oco === servico.cod_ocorrencia) ?? null;
		setOcorrenciaDetalhe(ocorrenciaRelacionada);
	};

	const closeOcorrenciaModal = () => {
		setOcorrenciaDetalhe(null);
	};

	const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			nome: createForm.nome,
			cod_orgao: Number(createForm.codOrgao),
			cod_ocorrencia: Number(createForm.codOcorrencia),
			descr: createForm.descricao,
			inicio_servico: createForm.inicioServico || null,
			fim_servico: createForm.fimServico || null,
		};

		const orgaoNome = orgaos.find((item) => String(item.cod_orgao) === createForm.codOrgao)?.nome ?? "";

		try {
			const response = await axios.post<Servico>(`${API_BASE_URL}/servicos`, payload);
			const responseData = response.data;

			setServicos((prev) => {
				const newItem = responseData
					? {
						...responseData,
						cod_ocorrencia:
							(responseData as Servico & { cod_ocorre?: number }).cod_ocorrencia ??
							((responseData as Servico & { cod_ocorre?: number }).cod_ocorre ?? responseData.cod_ocorrencia),
						orgao_nome:
							responseData.orgao_nome ??
							orgaos.find((item) => item.cod_orgao === responseData.cod_orgao)?.nome ??
							orgaoNome,
					}
				: {
					cod_servico: prev.length ? Math.max(...prev.map((item) => item.cod_servico)) + 1 : 1,
					cod_orgao: Number(createForm.codOrgao),
					cod_ocorrencia: Number(createForm.codOcorrencia),
					nome: createForm.nome,
					descr: createForm.descricao,
					inicio_servico: createForm.inicioServico || null,
					fim_servico: createForm.fimServico || null,
					orgao_nome: orgaoNome,
				};

				return [...prev, newItem];
			});

			setSuccessMessage("Serviço cadastrado com sucesso.");
			closeCreateModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível cadastrar o serviço.");
			} else {
				setErrorMessage("Erro inesperado ao cadastrar serviço.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingServico) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.put(`${API_BASE_URL}/servicos/${editingServico.cod_servico}`, {
				nome: editForm.nome,
				cod_orgao: Number(editForm.codOrgao),
				descr: editForm.descricao,
				inicio_servico: editForm.inicioServico || null,
				fim_servico: editForm.fimServico || null,
			});

			const orgaoNome = orgaos.find((item) => String(item.cod_orgao) === editForm.codOrgao)?.nome ?? editingServico.orgao_nome ?? "";

			setServicos((prev) =>
				prev.map((item) =>
					item.cod_servico === editingServico.cod_servico
						? {
							...item,
							nome: editForm.nome,
							cod_orgao: Number(editForm.codOrgao),
							descr: editForm.descricao,
							inicio_servico: editForm.inicioServico || null,
							fim_servico: editForm.fimServico || null,
							orgao_nome: orgaoNome,
						}
						: item
				)
			);

			setSuccessMessage("Serviço atualizado com sucesso.");
			closeEditModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível atualizar o serviço.");
			} else {
				setErrorMessage("Erro inesperado ao atualizar serviço.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteCandidate) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.delete(`${API_BASE_URL}/servicos/${deleteCandidate.cod_servico}`);
			setServicos((prev) => prev.filter((item) => item.cod_servico !== deleteCandidate.cod_servico));
			setSuccessMessage("Serviço excluído com sucesso.");
			closeDeleteModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível excluir o serviço.");
			} else {
				setErrorMessage("Erro inesperado ao excluir serviço.");
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
						<header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div className="space-y-4 text-center md:text-left">
								<h1 className="text-4xl font-semibold leading-tight text-neutral-900">Serviços</h1>
								<p className="max-w-2xl text-lg text-neutral-600">
									Acompanhe e mantenha os serviços vinculados às ocorrências registradas.
								</p>
							</div>
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
								className="flex items-center justify-center gap-2 rounded-full border border-lime-500 bg-lime-500 px-5 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-lime-400"
							>
								<span>Registrar serviço</span>
							</button>
						</div>
						{errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
						{successMessage && <p className="text-sm text-lime-600">{successMessage}</p>}
						<div className="grid gap-6 md:grid-cols-2">
							{isLoading ? (
								[...Array(4)].map((_, index) => (
									<div key={index} className="h-full rounded-3xl border border-neutral-200 bg-neutral-100 animate-pulse" />
								))
							) : filteredServicos.length === 0 ? (
								<div className="rounded-3xl border border-neutral-200 bg-white px-6 py-10 text-center text-neutral-500 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
									Nenhum serviço encontrado.
								</div>
							) : (
								filteredServicos.map((servico) => (
									<ServicoCard
										key={servico.cod_servico}
										servico={servico}
										onShowOcorrencia={openOcorrenciaModal}
										onEdit={openEditModal}
										onDelete={requestDeleteServico}
									/>
								))
							)}
						</div>
					</div>
				</main>
				<AppFooter />
			</div>
			<CreateServicoModal
				isOpen={isCreateModalOpen}
				orgaos={orgaos}
				ocorrencias={ocorrencias}
				formState={createForm}
				isSaving={isSaving}
				onClose={closeCreateModal}
				onSubmit={handleCreateSubmit}
				onChange={handleCreateFieldChange}
			/>
			<EditServicoModal
				servico={editingServico}
				orgaos={orgaos}
				formState={editForm}
				isSaving={isSaving}
				onClose={closeEditModal}
				onSubmit={handleEditSubmit}
				onChange={handleEditFieldChange}
			/>
			<DeleteServicoModal
				servico={deleteCandidate}
				isSaving={isSaving}
				onCancel={closeDeleteModal}
				onConfirm={handleDelete}
			/>
			<RelatedOcorrenciaModal ocorrencia={ocorrenciaDetalhe} onClose={closeOcorrenciaModal} />
		</div>
	);
};

export default ServicosPage;

"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import Navbar from "../../../components/Navbar";
import AlertPopup from "../../../components/AlertPopup";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
];

const normalizeServicoRecord = (
	servico: Servico | (Servico & { cod_ocorre?: number; nota_media_servico?: number | string | null }),
	orgaosList: OrgaoPublico[],
): Servico => {
	const extended = servico as Servico & { cod_ocorre?: number; nota_media_servico?: number | string | null };
	const codOcorrenciaRaw = extended.cod_ocorrencia ?? extended.cod_ocorre ?? servico.cod_ocorrencia;
	const notaMediaRaw = extended.nota_media_servico;
	const parsedNota = notaMediaRaw === null || notaMediaRaw === undefined ? null : Number(notaMediaRaw);
	const notaMedia = parsedNota !== null && Number.isFinite(parsedNota)
		? Math.round(parsedNota * 100) / 100
		: null;
	const orgaoNome =
		servico.orgao_nome ?? orgaosList.find((orgao) => orgao.cod_orgao === servico.cod_orgao)?.nome ?? "";

	return {
		...servico,
		cod_servico: Number(servico.cod_servico),
		cod_orgao: Number(servico.cod_orgao),
		cod_ocorrencia: Number(codOcorrenciaRaw),
		nota_media_servico: notaMedia,
		orgao_nome: orgaoNome,
	};
};

const ServicosPage = () => {
	const { isFuncionario } = useUser();
	const [servicos, setServicos] = useState<Servico[]>([]);
	const [orgaos, setOrgaos] = useState<OrgaoPublico[]>([]);
	const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
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

				const orgaosData = Array.isArray(orgaosResponse.data) ? orgaosResponse.data : [];
				const ocorrenciasData = Array.isArray(ocorrenciasResponse.data) ? ocorrenciasResponse.data : [];
				const servicosData = Array.isArray(servicosResponse.data) ? servicosResponse.data : [];

				const normalizedServicos = servicosData.map((servico) => normalizeServicoRecord(servico, orgaosData));

				setOrgaos(orgaosData);
				setOcorrencias(ocorrenciasData);
				setServicos(normalizedServicos);
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
			return servicos.sort((a, b) => a.cod_servico - b.cod_servico);
		}
		return servicos.filter((servico) => servico.nome.toLowerCase().includes(term))
			.sort((a, b) => a.cod_servico - b.cod_servico);
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

		const trimmedNome = createForm.nome.trim();
		const trimmedDescricao = createForm.descricao.trim();
		const codOrgaoValue = Number(createForm.codOrgao);
		const codOcorrenciaValue = Number(createForm.codOcorrencia);
		setSuccessMessage("");

		if (!trimmedNome) {
			setErrorMessage("Informe o nome do serviço.");
			return;
		}

		if (!Number.isFinite(codOrgaoValue) || codOrgaoValue <= 0) {
			setErrorMessage("Selecione um órgão público válido.");
			return;
		}

		if (!Number.isFinite(codOcorrenciaValue) || codOcorrenciaValue <= 0) {
			setErrorMessage("Selecione a ocorrência vinculada.");
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			nome: trimmedNome,
			cod_orgao: codOrgaoValue,
			cod_ocorrencia: codOcorrenciaValue,
			descr: trimmedDescricao || null,
			inicio_servico: createForm.inicioServico || null,
			fim_servico: createForm.fimServico || null,
		};

		try {
			const response = await axios.post<Servico>(`${API_BASE_URL}/servicos`, payload);
			const responseData = response.data;
			setServicos((prev) => {
				const record = responseData ? normalizeServicoRecord(responseData, orgaos) : normalizeServicoRecord({
					cod_servico: prev.length ? Math.max(...prev.map((item) => item.cod_servico)) + 1 : 1,
					cod_orgao: codOrgaoValue,
					cod_ocorrencia: codOcorrenciaValue,
					nome: trimmedNome,
					descr: trimmedDescricao || null,
					inicio_servico: createForm.inicioServico || null,
					fim_servico: createForm.fimServico || null,
					orgao_nome: null,
				}, orgaos);
				return [...prev, record];
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

		const trimmedNome = editForm.nome.trim();
		const trimmedDescricao = editForm.descricao.trim();
		const codOrgaoValue = Number(editForm.codOrgao);
		setSuccessMessage("");

		if (!trimmedNome) {
			setErrorMessage("Informe o nome do serviço.");
			return;
		}

		if (!Number.isFinite(codOrgaoValue) || codOrgaoValue <= 0) {
			setErrorMessage("Selecione um órgão público válido.");
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			const response = await axios.put<Servico>(`${API_BASE_URL}/servicos/${editingServico.cod_servico}`, {
				nome: trimmedNome,
				cod_orgao: codOrgaoValue,
				descr: trimmedDescricao || null,
				inicio_servico: editForm.inicioServico || null,
				fim_servico: editForm.fimServico || null,
			});

			const responseData = response.data ?? {
				...editingServico,
				nome: trimmedNome,
				cod_orgao: codOrgaoValue,
				descr: trimmedDescricao || null,
				inicio_servico: editForm.inicioServico || null,
				fim_servico: editForm.fimServico || null,
			};

			setServicos((prev) =>
				prev.map((item) =>
					item.cod_servico === editingServico.cod_servico
						? normalizeServicoRecord(responseData, orgaos)
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
				{errorMessage && (
					<AlertPopup type="error" message={errorMessage} onClose={() => setErrorMessage("")} />
				)}
				{successMessage && (
					<AlertPopup type="success" message={successMessage} onClose={() => setSuccessMessage("")} />
				)}
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

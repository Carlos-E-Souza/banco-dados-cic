"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppFooter from "../../../components/AppFooter";
import DeleteConfirmationModal from "../../../components/ocorrencias/DeleteConfirmationModal";
import EditOcorrenciaModal from "../../../components/ocorrencias/EditOcorrenciaModal";
import EvaluateOcorrenciaModal from "../../../components/ocorrencias/EvaluateOcorrenciaModal";
import OcorrenciaCard from "../../../components/ocorrencias/OcorrenciaCard";
import {
	AvaliacaoFormState,
	Ocorrencia,
	OcorrenciaFormState,
	TipoOcorrencia,
} from "../../../components/ocorrencias/types";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";

const listOcorrencias: Ocorrencia[] = [
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

const emptyForm: OcorrenciaFormState = {
	tipoOcorrencia: "",
	estado: "",
	municipio: "",
	bairro: "",
	endereco: "",
	data: "",
	status: "",
	descricao: "",
};

const emptyAvaliacaoForm: AvaliacaoFormState = {
	codServico: "",
	codMorador: "",
	notaServ: "",
	notaTempo: "",
	opiniao: "",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const listarLinksFuncionario = [
	{ href: "/ocorrencias/listar", label: "Listar Ocorrências" },
];

const listarLinksMorador = [
	{ href: "/ocorrencias/cadastrar", label: "Cadastrar Ocorrência" },
	{ href: "/ocorrencias/listar", label: "Listar Ocorrências" },
];

const OcorrenciasListarPage = () => {
	const { email, isFuncionario } = {email: "email", isFuncionario: true}; //useUser();
	const router = useRouter();
	const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(listOcorrencias);
	const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [editingOcorrencia, setEditingOcorrencia] = useState<Ocorrencia | null>(null);
	const [deleteCandidate, setDeleteCandidate] = useState<Ocorrencia | null>(null);
	const [avaliacaoOcorrencia, setAvaliacaoOcorrencia] = useState<Ocorrencia | null>(null);
	const [formState, setFormState] = useState<OcorrenciaFormState>(emptyForm);
	const [avaliacaoForm, setAvaliacaoForm] = useState<AvaliacaoFormState>(emptyAvaliacaoForm);
	const [isSaving, setIsSaving] = useState(false);

	const navLinks = useMemo(
		() => (isFuncionario ? listarLinksFuncionario : listarLinksMorador),
		[isFuncionario]
	);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			if (!email && !isFuncionario) {
				return;
			}

			setIsLoading(true);
			setErrorMessage("");

			try {
				const [ocorrenciasResponse, tiposResponse] = await Promise.all([
					axios.get<Ocorrencia[]>(`${API_BASE_URL}/ocorrencias`, {
						params: isFuncionario ? undefined : { email },
						signal: controller.signal,
					}),
					axios.get<TipoOcorrencia[]>(`${API_BASE_URL}/tipos-ocorrencia`, {
						signal: controller.signal,
					}),
				]);
				setOcorrencias(ocorrenciasResponse.data ?? []);
				setTipos(tiposResponse.data ?? []);
			} catch (error) {
				if (!controller.signal.aborted) {
					if (axios.isAxiosError(error)) {
						setErrorMessage(error.response?.data?.message ?? "Não foi possível carregar as ocorrências.");
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
	}, [email, isFuncionario]);

	const handleFieldChange = (field: keyof OcorrenciaFormState, value: string) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	const handleAvaliacaoFieldChange = (field: keyof AvaliacaoFormState, value: string) => {
		setAvaliacaoForm((prev) => ({ ...prev, [field]: value }));
	};

	const openEditModal = (occ: Ocorrencia) => {
		setEditingOcorrencia(occ);
		setFormState({
			tipoOcorrencia: String(occ.cod_tipo),
			estado: occ.estado ?? "",
			municipio: occ.municipio ?? "",
			bairro: occ.bairro ?? "",
			endereco: occ.endereco ?? "",
			data: occ.data ? occ.data.slice(0, 10) : "",
			status: occ.status ?? "",
			descricao: occ.descricao ?? "",
		});
		setSuccessMessage("");
		setErrorMessage("");
	};

	const requestDeleteOcorrencia = (occ: Ocorrencia) => {
		setDeleteCandidate(occ);
		setSuccessMessage("");
		setErrorMessage("");
	};

	const closeEditModal = () => {
		setEditingOcorrencia(null);
		setFormState(emptyForm);
	};

	const openAvaliacaoModal = (occ: Ocorrencia) => {
		setAvaliacaoOcorrencia(occ);
		setAvaliacaoForm(emptyAvaliacaoForm);
		setSuccessMessage("");
		setErrorMessage("");
	};

	const closeAvaliacaoModal = () => {
		setAvaliacaoOcorrencia(null);
		setAvaliacaoForm(emptyAvaliacaoForm);
	};

	const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingOcorrencia) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.put(`${API_BASE_URL}/ocorrencias/${editingOcorrencia.cod_oco}`, {
				tipo_ocorrencia: Number(formState.tipoOcorrencia),
				estado: formState.estado,
				municipio: formState.municipio,
				bairro: formState.bairro,
				endereco: formState.endereco,
				data: formState.data,
				status: formState.status,
				descricao: formState.descricao,
			});

			setOcorrencias((prev) =>
				prev.map((item) =>
					item.cod_oco === editingOcorrencia.cod_oco
						? {
							...item,
							cod_tipo: Number(formState.tipoOcorrencia),
							tipo_nome:
								tipos.find((tipo) => String(tipo.cod_tipo) === formState.tipoOcorrencia)?.nome ?? item.tipo_nome,
							estado: formState.estado,
							municipio: formState.municipio,
							bairro: formState.bairro,
							endereco: formState.endereco,
							data: formState.data,
							status: formState.status,
							descricao: formState.descricao,
						}
						: item
				)
			);
			setSuccessMessage("Ocorrência atualizada com sucesso.");
			closeEditModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível atualizar a ocorrência.");
			} else {
				setErrorMessage("Erro inesperado ao atualizar ocorrência.");
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
			await axios.delete(`${API_BASE_URL}/ocorrencias/${deleteCandidate.cod_oco}`);
			setOcorrencias((prev) => prev.filter((item) => item.cod_oco !== deleteCandidate.cod_oco));
			setSuccessMessage("Ocorrência removida com sucesso.");
			setDeleteCandidate(null);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível excluir a ocorrência.");
			} else {
				setErrorMessage("Erro inesperado ao excluir ocorrência.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleAvaliacaoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!avaliacaoOcorrencia) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.post(`${API_BASE_URL}/avaliacoes`, {
				cod_servico: Number(avaliacaoForm.codServico),
				cod_morador: Number(avaliacaoForm.codMorador),
				nota_serv: Number(avaliacaoForm.notaServ),
				nota_tempo: Number(avaliacaoForm.notaTempo),
				opiniao: avaliacaoForm.opiniao,
			});
			setSuccessMessage("Avaliação registrada com sucesso.");
			closeAvaliacaoModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível registrar a avaliação.");
			} else {
				setErrorMessage("Erro inesperado ao registrar avaliação.");
			}
		} finally {
			setIsSaving(false);
		}
	};
	

	if (!email && !isFuncionario) {
		return (
			<div className="min-h-screen bg-white text-neutral-900">
				<div className="flex min-h-screen flex-col">
					<Navbar links={navLinks} />
					<main className="flex flex-1 items-center justify-center px-6 py-16">
						<p className="rounded-3xl border border-neutral-200 bg-white px-8 py-10 text-neutral-600 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
							Faça login para visualizar suas ocorrências.
						</p>
					</main>
					<AppFooter />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar links={navLinks} />
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-6xl space-y-10">
						<div className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">
								Ocorrências registradas
							</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Gerencie suas manifestações. Editar e excluir estão disponíveis diretamente na lista.
							</p>
						</div>
						{errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
						{successMessage && <p className="text-sm text-lime-600">{successMessage}</p>}
						<div className="grid gap-6 md:grid-cols-2">
							{isLoading ? (
								[...Array(4)].map((_, index) => (
									<div
										key={index}
										className="h-full rounded-3xl border border-neutral-200 bg-neutral-100 animate-pulse"
									/>
								))
							) : ocorrencias.length === 0 ? (
								<div className="rounded-3xl border border-neutral-200 bg-white px-6 py-10 text-center text-neutral-500 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
									Nenhuma ocorrência encontrada.
								</div>
							) : (
								ocorrencias.map((occ) => (
									<OcorrenciaCard
										key={occ.cod_oco}
										ocorrencia={occ}
										isFuncionario={Boolean(isFuncionario)}
										onEdit={openEditModal}
										onDelete={requestDeleteOcorrencia}
										onEvaluate={openAvaliacaoModal}
									/>
								))
							)}
						</div>
					</div>
				</main>
				<AppFooter />
			</div>
			<EditOcorrenciaModal
				ocorrencia={editingOcorrencia}
				tipos={tipos}
				formState={formState}
				isSaving={isSaving}
				onClose={closeEditModal}
				onSubmit={handleEditSubmit}
				onChange={handleFieldChange}
			/>
			<DeleteConfirmationModal
				ocorrencia={deleteCandidate}
				isSaving={isSaving}
				onCancel={() => setDeleteCandidate(null)}
				onConfirm={handleDelete}
			/>
			<EvaluateOcorrenciaModal
				ocorrencia={avaliacaoOcorrencia}
				formState={avaliacaoForm}
				isSaving={isSaving}
				onClose={closeAvaliacaoModal}
				onSubmit={handleAvaliacaoSubmit}
				onChange={handleAvaliacaoFieldChange}
			/>
		</div>
	);
};

export default OcorrenciasListarPage;

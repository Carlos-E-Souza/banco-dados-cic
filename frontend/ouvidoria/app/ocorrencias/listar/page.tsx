"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import AlertPopup from "../../../components/AlertPopup";
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

const emptyForm: OcorrenciaFormState = {
	tipoOcorrencia: "",
	estado: "",
	cidade: "",
	bairro: "",
	endereco: "",
	data: "",
	descricao: "",
};

const emptyAvaliacaoForm: AvaliacaoFormState = {
	codServico: "",
	codMorador: "",
	notaServ: "",
	notaTempo: "",
	opiniao: "",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const listarLinksFuncionario = [
	{ href: "/ocorrencias", label: "Ocorrências" },
	{ href: "/ocorrencias/listar", label: "Listar Ocorrências" },
];

const listarLinksMorador = [
	{ href: "/ocorrencias", label: "Ocorrências" },
	{ href: "/ocorrencias/cadastrar", label: "Cadastrar Ocorrência" },
];

const OcorrenciasListarPage = () => {
	const { email, cpf, isFuncionario } = useUser();
	const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
	const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [editingOcorrencia, setEditingOcorrencia] = useState<Ocorrencia | null>(null);
	const [deleteCandidate, setDeleteCandidate] = useState<Ocorrencia | null>(null);
	const [avaliacaoOcorrencia, setAvaliacaoOcorrencia] = useState<Ocorrencia | null>(null);
	const [formState, setFormState] = useState<OcorrenciaFormState>(emptyForm);
	const [avaliacaoForm, setAvaliacaoForm] = useState<AvaliacaoFormState>(emptyAvaliacaoForm);
	const [avaliacaoId, setAvaliacaoId] = useState<number | null>(null);
	const [isLoadingAvaliacao, setIsLoadingAvaliacao] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const navLinks = useMemo(
		() => (isFuncionario ? listarLinksFuncionario : listarLinksMorador),
		[isFuncionario]
	);

	const sanitizedCpf = useMemo(() => (cpf ? cpf.replace(/\D/g, "") : ""), [cpf]);

	useEffect(() => {
		const controller = new AbortController();

		if (!isFuncionario && (!email || !cpf)) {
			setOcorrencias([]);
			return () => controller.abort();
		}

		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const ocorrenciasRequest = isFuncionario
					? axios.get<Ocorrencia[]>(`${API_BASE_URL}/ocorrencias`, { signal: controller.signal })
					: axios.get<Ocorrencia[]>(`${API_BASE_URL}/ocorrencias/cpf/${encodeURIComponent(cpf ?? "")}`, {
							signal: controller.signal,
					  });
				const tiposRequest = axios.get<TipoOcorrencia[]>(`${API_BASE_URL}/tipos-ocorrencias`, {
					signal: controller.signal,
				});

				const [ocorrenciasResponse, tiposResponse] = await Promise.all([ocorrenciasRequest, tiposRequest]);

				const normalizedOcorrencias = (ocorrenciasResponse.data ?? []).map((item) => ({
					...item,
					estado: item.estado ?? "",
					cidade: item.cidade ?? "",
					bairro: item.bairro ?? "",
					status: item.tipo_status ?? "",
					descricao: item.descr ?? null,
				}));

				setOcorrencias(normalizedOcorrencias);
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
	}, [cpf, email, isFuncionario]);

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
			cidade: occ.cidade ?? "",
			bairro: occ.bairro ?? "",
			endereco: occ.endereco ?? "",
			data: occ.data ? occ.data.slice(0, 10) : "",
			descricao: occ.descr ?? "",
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

	const openAvaliacaoModal = async (occ: Ocorrencia) => {
		setAvaliacaoOcorrencia(occ);
		setSuccessMessage("");
		setErrorMessage("");
		setAvaliacaoId(null);

		const baseForm: AvaliacaoFormState = {
			codServico: occ.cod_servico != null ? String(occ.cod_servico) : "",
			codMorador: (occ.morador_cpf ?? sanitizedCpf) || "",
			notaServ: "",
			notaTempo: "",
			opiniao: "",
		};
		setAvaliacaoForm(baseForm);
		setIsLoadingAvaliacao(true);

		try {
			const response = await axios.get(`${API_BASE_URL}/avaliacoes/ocorrencia/${occ.cod_oco}`);
			const data = response.data as {
				cod_aval?: number;
				cod_servico?: number | null;
				cpf_morador?: string | null;
				nota_serv?: number | null;
				nota_tempo?: number | null;
				opiniao?: string | null;
			};

			setAvaliacaoId(data.cod_aval ?? null);
			setAvaliacaoForm({
				codServico: data.cod_servico != null ? String(data.cod_servico) : baseForm.codServico,
				codMorador: (data.cpf_morador ?? baseForm.codMorador) || "",
				notaServ: data.nota_serv != null ? String(data.nota_serv) : "",
				notaTempo: data.nota_tempo != null ? String(data.nota_tempo) : "",
				opiniao: data.opiniao ?? "",
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status !== 404) {
					setErrorMessage(error.response?.data?.message ?? "Não foi possível carregar a avaliação.");
				}
			} else {
				setErrorMessage("Erro inesperado ao carregar avaliação.");
			}
		} finally {
			setIsLoadingAvaliacao(false);
		}
	};

	const closeAvaliacaoModal = () => {
		setAvaliacaoOcorrencia(null);
		setAvaliacaoForm(emptyAvaliacaoForm);
		setAvaliacaoId(null);
		setIsLoadingAvaliacao(false);
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
			const payload = {
				cod_tipo: Number(formState.tipoOcorrencia),
				endereco: formState.endereco.trim(),
				data: formState.data,
				descr: formState.descricao.trim() || null,
				localidade: {
					estado: formState.estado.trim(),
					cidade: formState.cidade.trim(),
					bairro: formState.bairro.trim(),
				},
			};

			const response = await axios.put<Ocorrencia>(
				`${API_BASE_URL}/ocorrencias/${editingOcorrencia.cod_oco}`,
				payload
			);
			const responseData = response.data;

			setOcorrencias((prev) =>
				prev.map((item) =>
					item.cod_oco === editingOcorrencia.cod_oco
						? {
							...item,
							...responseData,
							cod_tipo: responseData?.cod_tipo ?? Number(formState.tipoOcorrencia),
							tipo_nome:
								responseData?.tipo_nome ??
								tipos.find((tipo) => String(tipo.cod_tipo) === formState.tipoOcorrencia)?.nome ?? item.tipo_nome,
							estado: responseData?.estado ?? formState.estado.trim(),
							cidade: responseData?.cidade ?? formState.cidade.trim(),
							bairro: responseData?.bairro ?? formState.bairro.trim(),
							endereco: responseData?.endereco ?? formState.endereco.trim(),
							data: responseData?.data ?? formState.data,
							descr: responseData?.descr ?? (formState.descricao.trim() || null),
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
		if (!avaliacaoOcorrencia || isLoadingAvaliacao) {
			return;
		}

		const codServicoValue = Number(avaliacaoForm.codServico || (avaliacaoOcorrencia.cod_servico != null ? String(avaliacaoOcorrencia.cod_servico) : ""));
		if (!Number.isFinite(codServicoValue) || codServicoValue <= 0) {
			setErrorMessage("Serviço vinculado à ocorrência não encontrado.");
			return;
		}

		const codMoradorValue = (avaliacaoForm.codMorador || avaliacaoOcorrencia.morador_cpf || sanitizedCpf || "").trim();
		if (!codMoradorValue) {
			setErrorMessage("CPF do morador não disponível para a avaliação.");
			return;
		}

		const notaServValue = Number(avaliacaoForm.notaServ);
		if (!Number.isFinite(notaServValue) || notaServValue < 0 || notaServValue > 10) {
			setErrorMessage("Informe uma nota do serviço entre 0 e 10.");
			return;
		}

		const notaTempoValue = Number(avaliacaoForm.notaTempo);
		if (!Number.isFinite(notaTempoValue) || notaTempoValue < 0 || notaTempoValue > 10) {
			setErrorMessage("Informe uma nota do tempo de atendimento entre 0 e 10.");
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			cod_ocorrencia: avaliacaoOcorrencia.cod_oco,
			cod_servico: codServicoValue,
			cpf_morador: codMoradorValue,
			nota_serv: notaServValue,
			nota_tempo: notaTempoValue,
			opiniao: avaliacaoForm.opiniao.trim() || null,
		};

		try {
			const response = avaliacaoId
				? await axios.put(`${API_BASE_URL}/avaliacoes/${avaliacaoId}`, payload)
				: await axios.post(`${API_BASE_URL}/avaliacoes`, payload);
			const data = response.data as {
				cod_aval?: number;
				cod_servico?: number | null;
				cpf_morador?: string | null;
				nota_serv?: number | null;
				nota_tempo?: number | null;
				opiniao?: string | null;
			};

			setAvaliacaoId(data.cod_aval ?? avaliacaoId ?? null);
			setSuccessMessage(avaliacaoId ? "Avaliação atualizada com sucesso." : "Avaliação registrada com sucesso.");
			closeAvaliacaoModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível salvar a avaliação.");
			} else {
				setErrorMessage("Erro inesperado ao salvar avaliação.");
			}
		} finally {
			setIsSaving(false);
		}
	};
	

	if (!isFuncionario && (!email || !cpf)) {
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
				{errorMessage && (
					<AlertPopup type="error" message={errorMessage} onClose={() => setErrorMessage("")} />
				)}
				{successMessage && (
					<AlertPopup type="success" message={successMessage} onClose={() => setSuccessMessage("")} />
				)}
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
				isLoading={isLoadingAvaliacao}
				isEditing={avaliacaoId !== null}
				onClose={closeAvaliacaoModal}
				onSubmit={handleAvaliacaoSubmit}
				onChange={handleAvaliacaoFieldChange}
			/>
		</div>
	);
};

export default OcorrenciasListarPage;

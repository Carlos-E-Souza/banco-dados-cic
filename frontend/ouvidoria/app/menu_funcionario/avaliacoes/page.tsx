"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import AlertPopup from "../../../components/AlertPopup";
import AvaliacaoSearchBar from "../../../components/avaliacoes/AvaliacaoSearchBar";
import AvaliacaoTable from "../../../components/avaliacoes/AvaliacaoTable";
import DescriptionModal from "../../../components/avaliacoes/DescriptionModal";
import ServiceDetailsModal from "../../../components/avaliacoes/ServiceDetailsModal";
import { buildAvaliacaoDisplay } from "../../../components/avaliacoes/helpers";
import { Avaliacao, AvaliacaoDisplay, Morador } from "../../../components/avaliacoes/types";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";
import { Ocorrencia } from "../../../components/ocorrencias/types";
import RelatedOcorrenciaModal from "../../../components/servicos/RelatedOcorrenciaModal";
import { Servico } from "../../../components/servicos/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const funcionarioLinks = [
	{ href: "/menu_funcionario", label: "Menu" },
];

const parseNumber = (value: unknown, fallback = 0): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const parseOptionalNumber = (value: unknown): number | null => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

const parseString = (value: unknown, fallback = ""): string =>
	typeof value === "string" ? value : fallback;

const parseOptionalString = (value: unknown): string | null => {
	if (value === null || value === undefined) {
		return null;
	}
	return typeof value === "string" ? value : String(value);
};

const normalizeOcorrenciaRecord = (raw: unknown): Ocorrencia => {
	const record = (raw ?? {}) as Record<string, unknown>;
	const moradorCpfRaw = record.morador_cpf ?? record.cpf_morador ?? record.moradorCpf ?? record.cpf;

	return {
		cod_oco: parseNumber(record.cod_oco ?? record.cod_ocorrencia ?? record.codOcorrencia ?? record.codOco, 0),
		cod_tipo: parseNumber(record.cod_tipo ?? record.codTipo, 0),
		tipo_nome: parseString(record.tipo_nome ?? record.tipoNome, ""),
		cod_local: parseOptionalNumber(record.cod_local ?? record.codLocal),
		cod_servico: parseOptionalNumber(record.cod_servico ?? record.codServico),
		morador_cpf:
			typeof moradorCpfRaw === "string"
				? moradorCpfRaw
				: typeof moradorCpfRaw === "number"
					? String(moradorCpfRaw)
					: moradorCpfRaw != null
						? String(moradorCpfRaw)
						: null,
		estado: parseString(record.estado, ""),
		cidade: parseString(record.cidade, ""),
		bairro: parseString(record.bairro, ""),
		endereco: parseString(record.endereco, ""),
		data: parseString(record.data ?? record.data_ocorrencia ?? record.dataOcorrencia, ""),
		tipo_status: parseOptionalString(record.tipo_status ?? record.status),
		descr: parseOptionalString(record.descr ?? record.descricao),
	};
};

const normalizeMoradorRecord = (raw: unknown): Morador => {
	const record = (raw ?? {}) as Record<string, unknown>;

	return {
		cpf_morador: parseNumber(
			record.cpf_morador ?? record.cpfMorador ?? record.cpf ?? record.cod_morador ?? record.codMorador,
			0,
		),
		nome: parseString(record.nome ?? record.nome_morador ?? record.nomeMorador, ""),
		email: parseOptionalString(record.email ?? record.email_morador ?? record.emailMorador),
	};
};

const normalizeServicoRecord = (raw: unknown, ocorrenciasList: Ocorrencia[]): Servico => {
	const record = (raw ?? {}) as Record<string, unknown>;
	const codOcorrencia = parseNumber(
		record.cod_ocorrencia ?? record.cod_ocorre ?? record.codOcorrencia ?? record.codOcorre,
		0,
	);

	const ocorrenciaRelacionada = (record.ocorrencia as Ocorrencia | undefined) ??
		ocorrenciasList.find((item) => item.cod_oco === codOcorrencia) ??
		null;

	return {
		cod_servico: parseNumber(record.cod_servico ?? record.codServico, 0),
		cod_orgao: parseNumber(record.cod_orgao ?? record.codOrgao, 0),
		cod_ocorrencia: codOcorrencia,
		nome: parseString(record.nome ?? record.servico_nome ?? record.servicoNome, ""),
		descr: parseOptionalString(record.descr ?? record.descricao),
		inicio_servico: parseOptionalString(record.inicio_servico ?? record.inicioServico),
		fim_servico: parseOptionalString(record.fim_servico ?? record.fimServico),
		orgao_nome: parseOptionalString(record.orgao_nome ?? record.orgaoNome ?? record.nome_orgao),
		ocorrencia: ocorrenciaRelacionada,
	};
};

const normalizeAvaliacaoRecord = (raw: unknown): Avaliacao => {
	const record = (raw ?? {}) as Record<string, unknown>;

	return {
		cod_avaliacao: parseNumber(
			record.cod_avaliacao ?? record.codAvaliacao ?? record.cod_aval ?? record.codigo,
			0,
		),
		cod_servico: parseNumber(record.cod_servico ?? record.codServico, 0),
		cpf_morador: parseNumber(record.cpf_morador ?? record.cpfMorador ?? record.cpf, 0),
		nota_servico: parseNumber(
			record.nota_servico ?? record.nota_serv ?? record.notaServ ?? record.notaServico,
			0,
		),
		nota_tempo: parseNumber(
			record.nota_tempo ?? record.nota_tempo_atendimento ?? record.notaTempo ?? record.notaTempoAtendimento,
			0,
		),
		opiniao: parseOptionalString(record.opiniao ?? record.descricao ?? record.comentario),
		servico_nome: parseOptionalString(record.servico_nome ?? record.nome_servico ?? record.servicoNome),
		morador_nome: parseOptionalString(record.morador_nome ?? record.nome_morador ?? record.moradorNome),
	};
};

const AvaliacoesPage = () => {
	const { isFuncionario } = useUser();
	const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDisplay[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [alertType, setAlertType] = useState<"success" | "error">("error");
	const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
	const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
	const [descricaoSelecionada, setDescricaoSelecionada] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			setIsLoading(true);
			setAlertMessage("");

			try {
				const [avaliacoesResponse, servicosResponse, ocorrenciasResponse, moradoresResponse] = await Promise.all([
					axios.get<Avaliacao[]>(`${API_BASE_URL}/avaliacoes`, { signal: controller.signal }),
					axios.get<Servico[]>(`${API_BASE_URL}/servicos`, { signal: controller.signal }),
					axios.get<Ocorrencia[]>(`${API_BASE_URL}/ocorrencias`, { signal: controller.signal }),
					axios.get<Morador[]>(`${API_BASE_URL}/moradores`, { signal: controller.signal }),
				]);

				const ocorrenciasData = Array.isArray(ocorrenciasResponse.data) ? ocorrenciasResponse.data : [];
				const moradoresData = Array.isArray(moradoresResponse.data) ? moradoresResponse.data : [];
				const servicosData = Array.isArray(servicosResponse.data) ? servicosResponse.data : [];
				const avaliacoesData = Array.isArray(avaliacoesResponse.data) ? avaliacoesResponse.data : [];

				const normalizedOcorrencias = ocorrenciasData.map((item) => normalizeOcorrenciaRecord(item));
				const normalizedMoradores = moradoresData.map((item) => normalizeMoradorRecord(item));
				const normalizedServicos = servicosData.map((item) => normalizeServicoRecord(item, normalizedOcorrencias));
				const normalizedAvaliacoes = avaliacoesData.map((item) => normalizeAvaliacaoRecord(item));

				setAvaliacoes(
					buildAvaliacaoDisplay(
						normalizedAvaliacoes,
						normalizedServicos,
						normalizedOcorrencias,
						normalizedMoradores,
					),
				);
			} catch (error) {
				if (!controller.signal.aborted) {
					if (axios.isAxiosError(error)) {
						setAlertType("error");
						setAlertMessage(error.response?.data?.message ?? "Não foi possível carregar as avaliações.");
					} else {
						setAlertType("error");
						setAlertMessage("Erro inesperado ao carregar dados.");
					}
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();

		return () => controller.abort();
	}, []);

	const filteredAvaliacoes = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) {
			return avaliacoes.sort((a, b) => a.cod_avaliacao - b.cod_avaliacao);
		}
		return avaliacoes.filter((avaliacao) => avaliacao.servico_nome.toLowerCase().includes(term))
			.sort((a, b) => a.cod_avaliacao - b.cod_avaliacao);
	}, [avaliacoes, searchTerm]);

	const openOcorrenciaModal = (avaliacao: AvaliacaoDisplay) => {
		if (!avaliacao.ocorrenciaDetalhe) {
			setAlertType("error");
			setAlertMessage("Nenhuma ocorrência vinculada encontrada para este serviço.");
			return;
		}
		setAlertMessage("");
		setSelectedOcorrencia(avaliacao.ocorrenciaDetalhe);
	};

	const openServicoModal = (avaliacao: AvaliacaoDisplay) => {
		if (!avaliacao.servicoDetalhe) {
			setAlertType("error");
			setAlertMessage("Não foi possível encontrar detalhes do serviço relacionado.");
			return;
		}
		setAlertMessage("");
		setSelectedServico(avaliacao.servicoDetalhe);
	};

	const openDescricaoModal = (avaliacao: AvaliacaoDisplay) => {
		setAlertMessage("");
		setDescricaoSelecionada(avaliacao.opiniao ?? "");
	};

	const pageLinks = isFuncionario ? funcionarioLinks : undefined;

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				{alertMessage && (
					<AlertPopup type={alertType} message={alertMessage} onClose={() => setAlertMessage("")} />
				)}
				<Navbar links={pageLinks} />
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-6xl space-y-10">
						<header className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">Avaliações registradas</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Acompanhe o retorno dos moradores sobre os serviços prestados e consulte detalhes rapidamente.
							</p>
						</header>
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<AvaliacaoSearchBar value={searchTerm} onChange={setSearchTerm} />
						</div>
						<AvaliacaoTable
							avaliacoes={filteredAvaliacoes}
							isLoading={isLoading}
							onShowOcorrencia={openOcorrenciaModal}
							onShowServico={openServicoModal}
							onShowDescricao={openDescricaoModal}
						/>
					</div>
				</main>
				<AppFooter />
			</div>
			<ServiceDetailsModal servico={selectedServico} onClose={() => setSelectedServico(null)} />
			<DescriptionModal descricao={descricaoSelecionada} onClose={() => setDescricaoSelecionada(null)} />
			<RelatedOcorrenciaModal ocorrencia={selectedOcorrencia} onClose={() => setSelectedOcorrencia(null)} />
		</div>
	);
};

export default AvaliacoesPage;

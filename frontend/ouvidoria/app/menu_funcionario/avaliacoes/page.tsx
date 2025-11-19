"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import AvaliacaoSearchBar from "../../../components/avaliacoes/AvaliacaoSearchBar";
import AvaliacaoTable from "../../../components/avaliacoes/AvaliacaoTable";
import DescriptionModal from "../../../components/avaliacoes/DescriptionModal";
import ServiceDetailsModal from "../../../components/avaliacoes/ServiceDetailsModal";
import { buildAvaliacaoDisplay } from "../../../components/avaliacoes/helpers";
import { mockAvaliacoes, mockMoradores, mockOcorrencias, mockServicos } from "../../../components/avaliacoes/mockData";
import { Avaliacao, AvaliacaoDisplay, Morador } from "../../../components/avaliacoes/types";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";
import { Ocorrencia } from "../../../components/ocorrencias/types";
import RelatedOcorrenciaModal from "../../../components/servicos/RelatedOcorrenciaModal";
import { Servico } from "../../../components/servicos/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const funcionarioLinks = [
	{ href: "/menu_funcionario", label: "Menu" },
	{ href: "/menu_funcionario/avaliacoes", label: "Avaliações" },
];

const AvaliacoesPage = () => {
	const { isFuncionario } = useUser();
	const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDisplay[]>(() =>
		buildAvaliacaoDisplay(mockAvaliacoes, mockServicos, mockOcorrencias, mockMoradores),
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
	const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
	const [descricaoSelecionada, setDescricaoSelecionada] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const [avaliacoesResponse, servicosResponse, ocorrenciasResponse, moradoresResponse] = await Promise.all([
					axios.get<Avaliacao[]>(`${API_BASE_URL}/avaliacoes`, { signal: controller.signal }),
					axios.get<Servico[]>(`${API_BASE_URL}/servicos`, { signal: controller.signal }),
					axios.get<Ocorrencia[]>(`${API_BASE_URL}/ocorrencias`, { signal: controller.signal }),
					axios.get<Morador[]>(`${API_BASE_URL}/moradores`, { signal: controller.signal }),
				]);

				const ocorrenciasData = ocorrenciasResponse.data?.length ? ocorrenciasResponse.data : mockOcorrencias;
				const moradoresData = moradoresResponse.data?.length ? moradoresResponse.data : mockMoradores;
				const servicosData = servicosResponse.data?.length ? servicosResponse.data : mockServicos;
				const avaliacoesData = avaliacoesResponse.data?.length ? avaliacoesResponse.data : mockAvaliacoes;

				const normalizedOcorrencias = ocorrenciasData.map((item) => ({
					...item,
					cod_oco: Number((item as Ocorrencia & { codOcorrencia?: number }).cod_oco ?? (item as Ocorrencia & { codOcorrencia?: number }).codOcorrencia ?? item.cod_oco),
				}));

				const normalizedMoradores = moradoresData.map((item) => ({
					cod_morador: Number((item as Morador & { codMorador?: number }).cod_morador ?? (item as Morador & { codMorador?: number }).codMorador ?? item.cod_morador),
					nome: (item as Morador).nome ?? (item as { nome_morador?: string }).nome_morador ?? "",
					email: (item as Morador).email ?? null,
				}));

				const normalizedServicos = servicosData.map((servico) => {
					const rawCodOcorrencia =
						(servico as Servico & { cod_ocorre?: number; codOcorrencia?: number }).cod_ocorrencia ??
						(servico as Servico & { cod_ocorre?: number; codOcorrencia?: number }).cod_ocorre ??
						(servico as Servico & { cod_ocorre?: number; codOcorrencia?: number }).codOcorrencia ??
						servico.cod_ocorrencia;

					const codOcorrencia = Number(rawCodOcorrencia);
					const ocorrenciaRelacionada =
						(servico as Servico).ocorrencia ??
						normalizedOcorrencias.find((ocorrencia) => ocorrencia.cod_oco === codOcorrencia) ??
						null;

					return {
						...servico,
						cod_servico: Number((servico as Servico & { codServico?: number }).cod_servico ?? (servico as Servico & { codServico?: number }).codServico ?? servico.cod_servico),
						cod_orgao: Number((servico as Servico & { codOrgao?: number }).cod_orgao ?? (servico as Servico & { codOrgao?: number }).codOrgao ?? servico.cod_orgao),
						cod_ocorrencia: Number.isFinite(codOcorrencia) ? codOcorrencia : 0,
						nome: servico.nome ?? (servico as { servico_nome?: string }).servico_nome ?? "",
						descr: servico.descr ?? (servico as { descricao?: string }).descricao ?? null,
						inicio_servico: servico.inicio_servico ?? (servico as { inicioServico?: string }).inicioServico ?? null,
						fim_servico: servico.fim_servico ?? (servico as { fimServico?: string }).fimServico ?? null,
						orgao_nome: servico.orgao_nome ?? (servico as { orgaoNome?: string }).orgaoNome ?? "",
						ocorrencia: ocorrenciaRelacionada,
					};
				});

				const normalizedAvaliacoes = avaliacoesData.map((avaliacao) => {
					const notaServico = Number(
						(avaliacao as Avaliacao & { notaServ?: number }).nota_servico ??
						(avaliacao as Avaliacao & { notaServ?: number }).notaServ ??
						(avaliacao as Avaliacao & { notaServico?: number }).notaServico ??
						avaliacao.nota_servico,
					);
					const notaTempo = Number(
						(avaliacao as Avaliacao & { notaTempo?: number }).nota_tempo ??
						(avaliacao as Avaliacao & { notaTempo?: number }).notaTempo ??
						(avaliacao as Avaliacao & { notaTempoAtendimento?: number }).notaTempoAtendimento ??
						avaliacao.nota_tempo,
					);

					return {
						cod_avaliacao: Number(
							(avaliacao as Avaliacao & { codAvaliacao?: number }).cod_avaliacao ??
							(avaliacao as Avaliacao & { codAvaliacao?: number }).codAvaliacao ??
							avaliacao.cod_avaliacao,
						),
						cod_servico: Number(
							(avaliacao as Avaliacao & { codServico?: number }).cod_servico ??
							(avaliacao as Avaliacao & { codServico?: number }).codServico ??
							avaliacao.cod_servico,
						),
						cod_morador: Number(
							(avaliacao as Avaliacao & { codMorador?: number }).cod_morador ??
							(avaliacao as Avaliacao & { codMorador?: number }).codMorador ??
							avaliacao.cod_morador,
						),
						nota_servico: Number.isFinite(notaServico) ? notaServico : 0,
						nota_tempo: Number.isFinite(notaTempo) ? notaTempo : 0,
						opiniao:
							(avaliacao as Avaliacao).opiniao ??
							(avaliacao as { descricao?: string }).descricao ??
							(avaliacao as { comentario?: string }).comentario ??
							null,
						servico_nome:
							(avaliacao as Avaliacao).servico_nome ??
							(avaliacao as { nome_servico?: string }).nome_servico ??
							undefined,
						morador_nome:
							(avaliacao as Avaliacao).morador_nome ??
							(avaliacao as { nome_morador?: string }).nome_morador ??
							undefined,
					};
				});

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
						setErrorMessage(error.response?.data?.message ?? "Não foi possível carregar as avaliações.");
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

	const filteredAvaliacoes = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) {
			return avaliacoes;
		}
		return avaliacoes.filter((avaliacao) => avaliacao.servico_nome.toLowerCase().includes(term));
	}, [avaliacoes, searchTerm]);

	const openOcorrenciaModal = (avaliacao: AvaliacaoDisplay) => {
		if (!avaliacao.ocorrenciaDetalhe) {
			setErrorMessage("Nenhuma ocorrência vinculada encontrada para este serviço.");
			return;
		}
		setErrorMessage("");
		setSelectedOcorrencia(avaliacao.ocorrenciaDetalhe);
	};

	const openServicoModal = (avaliacao: AvaliacaoDisplay) => {
		if (!avaliacao.servicoDetalhe) {
			setErrorMessage("Não foi possível encontrar detalhes do serviço relacionado.");
			return;
		}
		setErrorMessage("");
		setSelectedServico(avaliacao.servicoDetalhe);
	};

	const openDescricaoModal = (avaliacao: AvaliacaoDisplay) => {
		setErrorMessage("");
		setDescricaoSelecionada(avaliacao.opiniao ?? "");
	};

	const pageLinks = isFuncionario ? funcionarioLinks : undefined;

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
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
						{errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
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

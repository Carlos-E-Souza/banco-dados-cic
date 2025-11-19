import { Ocorrencia } from "../ocorrencias/types";
import { Servico } from "../servicos/types";
import { Avaliacao, AvaliacaoDisplay, Morador } from "./types";

export function buildAvaliacaoDisplay(
	avaliacoes: Avaliacao[],
	servicos: Servico[],
	ocorrencias: Ocorrencia[],
	moradores: Morador[],
): AvaliacaoDisplay[] {
	const servicoById = new Map(servicos.map((servico) => [servico.cod_servico, servico]));
	const ocorrenciaById = new Map(ocorrencias.map((ocorrencia) => [ocorrencia.cod_oco, ocorrencia]));
	const moradorById = new Map(moradores.map((morador) => [morador.cod_morador, morador]));

	return avaliacoes.map((avaliacao) => {
		const servico = servicoById.get(avaliacao.cod_servico) ?? null;
		const ocorrencia = servico?.ocorrencia ?? (servico ? ocorrenciaById.get(servico.cod_ocorrencia) ?? null : null);
		const morador = moradorById.get(avaliacao.cod_morador) ?? null;

		return {
			cod_avaliacao: avaliacao.cod_avaliacao,
			cod_servico: avaliacao.cod_servico,
			cod_morador: avaliacao.cod_morador,
			servico_nome: (avaliacao.servico_nome ?? servico?.nome ?? "").trim() || "Serviço não identificado",
			morador_nome: (avaliacao.morador_nome ?? morador?.nome ?? "").trim() || "Morador não identificado",
			nota_servico: Number.isFinite(avaliacao.nota_servico) ? avaliacao.nota_servico : 0,
			nota_tempo: Number.isFinite(avaliacao.nota_tempo) ? avaliacao.nota_tempo : 0,
			opiniao: avaliacao.opiniao ?? null,
			servicoDetalhe: servico ?? null,
			ocorrenciaDetalhe: ocorrencia ?? null,
		};
	});
}

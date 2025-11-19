import { Ocorrencia } from "../ocorrencias/types";
import { Servico } from "../servicos/types";

export type Morador = {
	cod_morador: number;
	nome: string;
	email?: string | null;
};

export type Avaliacao = {
	cod_avaliacao: number;
	cod_servico: number;
	cod_morador: number;
	nota_servico: number;
	nota_tempo: number;
	opiniao?: string | null;
	servico_nome?: string | null;
	morador_nome?: string | null;
};

export type AvaliacaoDisplay = {
	cod_avaliacao: number;
	cod_servico: number;
	cod_morador: number;
	servico_nome: string;
	morador_nome: string;
	nota_servico: number;
	nota_tempo: number;
	opiniao: string | null;
	servicoDetalhe: Servico | null;
	ocorrenciaDetalhe: Ocorrencia | null;
};

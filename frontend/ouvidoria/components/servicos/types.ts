import { Ocorrencia } from "../ocorrencias/types";

export type Servico = {
	cod_servico: number;
	cod_orgao: number;
	cod_ocorrencia: number;
	nome: string;
	descr?: string | null;
	inicio_servico?: string | null;
	fim_servico?: string | null;
	orgao_nome?: string | null;
	nota_media_servico?: number | null;
	ocorrencia?: Ocorrencia | null;
};

export type CreateServicoFormState = {
	nome: string;
	codOrgao: string;
	codOcorrencia: string;
	descricao: string;
	inicioServico: string;
	fimServico: string;
};

export type EditServicoFormState = {
	nome: string;
	codOrgao: string;
	descricao: string;
	inicioServico: string;
	fimServico: string;
};

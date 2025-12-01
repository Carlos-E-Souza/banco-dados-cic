export type TipoOcorrencia = {
	cod_tipo: number;
	nome: string;
};

export type Ocorrencia = {
	cod_oco: number;
	cod_tipo: number;
	tipo_nome: string;
	cod_local?: number | null;
	cod_servico?: number | null;
	morador_cpf?: string | null;
	estado: string;
	cidade: string;
	bairro: string;
	endereco: string;
	data: string;
	tipo_status?: string | null;
	descr?: string | null;
};

export type OcorrenciaFormState = {
	tipoOcorrencia: string;
	estado: string;
	cidade: string;
	bairro: string;
	endereco: string;
	data: string;
	descricao: string;
};

export type AvaliacaoFormState = {
	codServico: string;
	codMorador: string;
	notaServ: string;
	notaTempo: string;
	opiniao: string;
};

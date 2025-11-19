export type TipoOcorrencia = {
	cod_tipo: number;
	nome: string;
};

export type Ocorrencia = {
	cod_oco: number;
	cod_tipo: number;
	tipo_nome: string;
	estado: string;
	municipio: string;
	bairro: string;
	endereco: string;
	data: string;
	status: string;
	descricao?: string | null;
};

export type OcorrenciaFormState = {
	tipoOcorrencia: string;
	estado: string;
	municipio: string;
	bairro: string;
	endereco: string;
	data: string;
	status: string;
	descricao: string;
};

export type AvaliacaoFormState = {
	codServico: string;
	codMorador: string;
	notaServ: string;
	notaTempo: string;
	opiniao: string;
};

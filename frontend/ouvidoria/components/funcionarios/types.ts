export type Cargo = {
	cod_cargo: number;
	nome: string;
	descricao?: string | null;
};

export type OrgaoPublico = {
	cod_orgao: number;
	nome: string;
	estado: string;
	descr?: string | null;
	data_ini?: string;
	data_fim?: string | null;
};

export type Funcionario = {
	cpf: string;
	nome: string;
	orgao_pub: number;
	orgao_nome: string;
	cargo: number;
	cargo_nome: string;
	data_nasc: string;
	inicio_contrato: string;
	fim_contrato?: string | null;
};

export type FuncionarioFormState = {
	cpf: string;
	nome: string;
	orgaoPub: string;
	cargo: string;
	dataNasc: string;
	inicioContrato: string;
	fimContrato: string;
};

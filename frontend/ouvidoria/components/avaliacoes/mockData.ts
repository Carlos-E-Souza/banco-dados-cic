import { Ocorrencia } from "../ocorrencias/types";
import { Servico } from "../servicos/types";
import { Avaliacao, Morador } from "./types";

export const mockOcorrencias: Ocorrencia[] = [
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

export const mockServicos: Servico[] = [
	{
		cod_servico: 201,
		cod_orgao: 1,
		cod_ocorrencia: 101,
		nome: "Recomposição de asfalto",
		descr: "Equipe de manutenção realizará o reparo do buraco e nivelamento da via.",
		inicio_servico: "2024-09-20",
		fim_servico: null,
		orgao_nome: "Secretaria de Obras",
		ocorrencia: mockOcorrencias[0],
	},
	{
		cod_servico: 202,
		cod_orgao: 2,
		cod_ocorrencia: 102,
		nome: "Substituição de lâmpada",
		descr: "Manutenção programada para troca da lâmpada queimada.",
		inicio_servico: "2024-09-10",
		fim_servico: "2024-09-12",
		orgao_nome: "Secretaria de Educação",
		ocorrencia: mockOcorrencias[1],
	},
];

export const mockMoradores: Morador[] = [
	{ cod_morador: 301, nome: "Carla Mendes", email: "carla@example.com" },
	{ cod_morador: 302, nome: "Pedro Alves", email: "pedro@example.com" },
	{ cod_morador: 303, nome: "Luciana Prado", email: "luciana@example.com" },
];

export const mockAvaliacoes: Avaliacao[] = [
	{
		cod_avaliacao: 401,
		cod_servico: 201,
		cod_morador: 301,
		nota_servico: 4,
		nota_tempo: 3,
		opiniao: "Equipe atendeu muito bem, mas o reparo demorou alguns dias a mais que o previsto.",
	},
	{
		cod_avaliacao: 402,
		cod_servico: 202,
		cod_morador: 302,
		nota_servico: 5,
		nota_tempo: 5,
		opiniao: "Serviço rápido e eficiente, iluminação voltou a funcionar no mesmo dia.",
	},
	{
		cod_avaliacao: 403,
		cod_servico: 201,
		cod_morador: 303,
		nota_servico: 3,
		nota_tempo: 2,
		opiniao: "Reparo ficou bom, mas o processo todo foi demorado e faltou comunicação.",
	},
];

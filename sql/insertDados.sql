USE PROJETO1BD;


-- CARGOS
INSERT INTO CARGO (nome, descricao) VALUES
('Analista', 'Analista administrativo'),
('Coordenador', 'Coordena equipes de servico'),
('Tecnico', 'Tecnico de campo'),
('Supervisor', 'Supervisiona operacoes'),
('Atendente', 'Atendimento ao publico');


-- ORGAOS PUBLICOS
INSERT INTO ORGAO_PUBLICO (nome, estado, descr, data_ini, data_fim) VALUES
('Secretaria de Obras', 'Distrito Federal', 'Responsavel por obras publicas', '2010-01-15', NULL),
('Secretaria de Saude', 'Distrito Federal', 'Gestao de saude', '2012-03-10', NULL),
('Agencia de Transporte', 'Distrito Federal', 'Transporte urbano', '2015-07-01', NULL),
('Secretaria de Educacao', 'Distrito Federal', 'Educacao basica', '2008-02-20', NULL),
('Secretaria de Meio Ambiente', 'Distrito Federal', 'Politicas ambientais', '2018-05-05', NULL);


-- LOCALIDADES
INSERT INTO LOCALIDADE (estado, cidade, bairro) VALUES
('Distrito Federal', 'Brasilia', 'Asa Norte'),
('Distrito Federal', 'Brasilia', 'Asa Sul'),
('Distrito Federal', 'Brasilia', 'Ceilandia'),
('Distrito Federal', 'Brasilia', 'Taguatinga'),
('Distrito Federal', 'Brasilia', 'Samambaia');


-- FUNCIONARIOS
INSERT INTO FUNCIONARIO (
	cpf, nome, orgao_pub, cargo, data_nasc, inicio_contrato, fim_contrato, senha
) VALUES
('11111111111', 'Carlos Almeida', 1, 1, '1985-04-12', '2020-01-01', NULL, 'senha_1111'),
('22222222222', 'Fernanda Souza', 2, 2, '1990-06-25', '2019-02-15', NULL, 'senha_2222'),
('33333333333', 'Joao Pereira', 3, 3, '1987-09-03', '2021-05-10', NULL, 'senha_3333'),
('44444444444', 'Marina Costa', 4, 4, '1992-11-18', '2018-08-20', NULL, 'senha_4444'),
('55555555555', 'Rafael Silva', 5, 5, '1984-01-29', '2017-04-05', NULL, 'senha_5555');


-- FOTOS
INSERT INTO FOTO (cpf_func, imagem) VALUES
('11111111111', NULL),
('22222222222', NULL),
('33333333333', NULL),
('44444444444', NULL),
('55555555555', NULL);


-- MORADORES
INSERT INTO MORADOR (cpf, nome, cod_local, endereco, data_nasc, senha) VALUES
('66666666666', 'Ana Martins', 1, 'Rua das Flores, 100', '1995-02-14', 'senha_m1'),
('77777777777', 'Bruno Rocha', 2, 'Rua das Palmeiras, 50', '1989-07-21', 'senha_m2'),
('88888888888', 'Camila Ribeiro', 3, 'Rua do Sol, 200', '1993-12-05', 'senha_m3'),
('99999999999', 'Diego Araujo', 4, 'Rua das Acacias, 80', '1988-10-30', 'senha_m4'),
('10101010101', 'Elisa Menezes', 5, 'Rua das Laranjeiras, 150', '1996-03-11', 'senha_m5');


-- EMAILS
INSERT INTO EMAIL (cpf_func, cpf_morador, email) VALUES
('11111111111', NULL, 'carlos.almeida@orgao.gov'),
('22222222222', NULL, 'fernanda.souza@orgao.gov'),
('33333333333', NULL, 'joao.pereira@orgao.gov'),
('44444444444', NULL, 'marina.costa@orgao.gov'),
('55555555555', NULL, 'rafael.silva@orgao.gov'),
(NULL, '66666666666', 'ana.martins@email.com'),
(NULL, '77777777777', 'bruno.rocha@email.com'),
(NULL, '88888888888', 'camila.ribeiro@email.com'),
(NULL, '99999999999', 'diego.araujo@email.com'),
(NULL, '10101010101', 'elisa.menezes@email.com');


-- TELEFONES
INSERT INTO TELEFONE (telefone, cpf_morador, DDD) VALUES
('900000001', '66666666666', '61'),
('900000002', '77777777777', '61'),
('900000003', '88888888888', '61'),
('900000004', '99999999999', '61'),
('900000005', '10101010101', '61');


-- TIPOS DE OCORRENCIA
INSERT INTO TIPO_OCORRENCIA (orgao_pub, nome, descr) VALUES
(1, 'Iluminacao', 'Falhas de iluminacao publica'),
(2, 'Saude', 'Ocorrencias relacionadas a saude'),
(3, 'Transporte', 'Problemas no transporte'),
(4, 'Educacao', 'Demandas de educacao'),
(5, 'Meio Ambiente', 'Cuidados ambientais');


-- OCORRENCIAS
INSERT INTO OCORRENCIA (
	cod_tipo, cod_local, endereco, cpf_morador, data, tipo_status, descr
) VALUES
(1, 1, 'Quadra 101, lote 10', '66666666666', '2023-01-05', 'FINALIZADA', 'Lampada queimada na via'),
(2, 2, 'Quadra 202, bloco B', '77777777777', '2023-02-12', 'FINALIZADA', 'Posto de saude sem insumos'),
(3, 3, 'Quadra 303, casa 12', '88888888888', '2023-03-08', 'FINALIZADA', 'Ponto de onibus danificado'),
(4, 4, 'Quadra 404, apto 301', '99999999999', '2023-04-20', 'FINALIZADA', 'Escola com falta de materiais'),
(5, 5, 'Quadra 505, lote 07', '10101010101', '2023-05-18', 'FINALIZADA', 'Area verde sem manutencao'),
(3, 1, 'Quadra 106, lote 15', '66666666666', '2023-06-10', 'NAO INICIADA', 'Buraco na via publica'),
(2, 2, 'Quadra 207, bloco C', '66666666666', '2023-06-15', 'EM ANDAMENTO', 'Fila longa no posto de saude');


-- SERVICOS
INSERT INTO SERVICO (
	cod_orgao, cod_ocorrencia, nome, descr, inicio_servico, fim_servico, nota_media_servico
) VALUES
(1, 1, 'Substituicao de Lampadas', 'Troca de lampadas queimadas', '2023-01-10', '2023-01-15', NULL),
(2, 2, 'Reforco de Estoque', 'Reposicao de insumos medicos', '2023-02-15', '2023-02-25', NULL),
(3, 3, 'Reparo em Abrigo', 'Reparo do abrigo de onibus', '2023-03-10', '2023-03-18', NULL),
(4, 4, 'Entrega de Materiais Escolares', 'Distribuicao de materiais', '2023-04-25', '2023-04-30', NULL),
(5, 5, 'Limpeza de Area Verde', 'Limpeza e poda de area verde', '2023-05-20', '2023-05-25', NULL),
(2, 7, 'Atendimento Extra', 'Aumento do numero de atendimentos', '2023-06-20', NULL, NULL);


-- AVALIACOES
INSERT INTO AVALIACAO (
	cod_ocorrencia, cod_servico, cpf_morador, nota_serv, nota_tempo, opiniao
) VALUES
(1, 1, '66666666666', 5, 4, 'Servico rapido e eficaz'),
(2, 2, '77777777777', 4, 3, 'Melhorou, mas demorou'),
(3, 3, '88888888888', 5, 5, 'Reparo perfeito'),
(4, 4, '99999999999', 3, 3, 'Material entregue parcialmente'),
(5, 5, '10101010101', 4, 4, 'Limpeza adequada');

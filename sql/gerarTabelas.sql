USE PROJETO1BD;


DROP TABLE IF EXISTS AVALIACAO;
DROP TABLE IF EXISTS SERVICO;
DROP TABLE IF EXISTS OCORRENCIA;
DROP TABLE IF EXISTS TIPO_OCORRENCIA;
DROP TABLE IF EXISTS FOTO;
DROP TABLE IF EXISTS EMAIL;
DROP TABLE IF EXISTS TELEFONE;
DROP TABLE IF EXISTS FUNCIONARIO;
DROP TABLE IF EXISTS MORADOR;
DROP TABLE IF EXISTS LOCALIDADE;
DROP TABLE IF EXISTS ORGAO_PUBLICO;
DROP TABLE IF EXISTS CARGO;


CREATE TABLE CARGO (
    cod_cargo INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao VARCHAR(200)
);


CREATE TABLE ORGAO_PUBLICO (
    cod_orgao INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado VARCHAR(18) NOT NULL,
    descr VARCHAR(200),
    data_ini DATE NOT NULL,
    data_fim DATE
);


CREATE TABLE FUNCIONARIO (
    cpf VARCHAR(11) NOT NULL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    orgao_pub INT NOT NULL,
    cargo INT NOT NULL,
    data_nasc DATE NOT NULL,
    inicio_contrato DATE NOT NULL,
    fim_contrato DATE,
    senha VARCHAR(100) NOT NULL,
    FOREIGN KEY (orgao_pub) REFERENCES ORGAO_PUBLICO(cod_orgao)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cargo) REFERENCES CARGO(cod_cargo)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE FOTO (
    cod_foto INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cpf_func VARCHAR(11) NOT NULL,
    imagem LONGBLOB,
    FOREIGN KEY (cpf_func) REFERENCES FUNCIONARIO(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE LOCALIDADE (
    cod_local INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    estado VARCHAR(30) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL
);


CREATE TABLE MORADOR (
    cpf VARCHAR(11) NOT NULL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cod_local INT NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    data_nasc DATE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    FOREIGN KEY (cod_local) REFERENCES LOCALIDADE(cod_local)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE EMAIL (
    cod_email INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cpf_func VARCHAR(11),
    cpf_morador VARCHAR(11),
    email VARCHAR(200),
    FOREIGN KEY (cpf_func) REFERENCES FUNCIONARIO(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cpf_morador) REFERENCES MORADOR(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE TELEFONE (
    telefone VARCHAR(9) NOT NULL PRIMARY KEY,
    cpf_morador VARCHAR(11),
    DDD VARCHAR(2),
    FOREIGN KEY (cpf_morador) REFERENCES MORADOR(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE TIPO_OCORRENCIA (
    cod_tipo INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    orgao_pub INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descr VARCHAR(200),
    FOREIGN KEY (orgao_pub) REFERENCES ORGAO_PUBLICO(cod_orgao)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE OCORRENCIA (
    cod_oco INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cod_tipo INT NOT NULL,
    cod_local INT NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    cod_morador INT NOT NULL,
    data DATE NOT NULL,
    tipo_status VARCHAR(10) NOT NULL,
    descr VARCHAR(200),
    FOREIGN KEY (cod_tipo) REFERENCES TIPO_OCORRENCIA(cod_tipo)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cod_local) REFERENCES LOCALIDADE(cod_local)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cpf_morador) REFERENCES MORADOR(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE SERVICO (
    cod_servico INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cod_orgao INT NOT NULL,
    cod_ocorrencia INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descr VARCHAR(200),
    inicio_servico DATE,
    fim_servico DATE,
    nota_media_servico DECIMAL(4,2) DEFAULT NULL,
    FOREIGN KEY (cod_orgao) REFERENCES ORGAO_PUBLICO(cod_orgao)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cod_ocorrencia) REFERENCES OCORRENCIA(cod_oco)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE AVALIACAO (
    cod_aval INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cod_ocorrencia INT NOT NULL,
    cod_servico INT NOT NULL,
    cpf_morador VARCHAR(11) NOT NULL,
    nota_serv INT NOT NULL,
    nota_tempo INT NOT NULL,
    opiniao VARCHAR(200),
    FOREIGN KEY (cod_ocorrencia) REFERENCES OCORRENCIA(cod_oco)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cod_servico) REFERENCES SERVICO(cod_servico)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cpf_morador) REFERENCES MORADOR(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);


-- VIEWS

CREATE VIEW vw_avaliacoes_completas AS
SELECT
    a.cod_aval,
    s.cod_servico,
    s.nome          AS servico_nome,
    s.descr         AS servico_descr,
    o.cod_oco,
    o.tipo_status,
    org.nome        AS orgao_nome,
    m.cpf           AS morador_cpf,
    m.nome          AS morador_nome,
    a.nota_serv,
    a.nota_tempo,
    a.opiniao,
    o.data          AS data_ocorrencia,
    s.inicio_servico,
    s.fim_servico
FROM AVALIACAO a
JOIN SERVICO s      ON s.cod_servico = a.cod_servico
JOIN OCORRENCIA o   ON o.cod_oco     = a.cod_ocorrencia
JOIN ORGAO_PUBLICO org ON org.cod_orgao = s.cod_orgao
JOIN MORADOR m      ON m.cpf          = a.cod_morador;


-- PROCEDURES

DELIMITER $$

CREATE PROCEDURE sp_registrar_avaliacao (
    IN p_cod_ocorrencia INT,
    IN p_cod_servico    INT,
    IN p_cod_morador    VARCHAR(11),
    IN p_nota_serv      INT,
    IN p_nota_tempo     INT,
    IN p_opiniao        VARCHAR(200),
    OUT p_novo_cod_aval INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_novo_cod_aval = NULL;
    END;

    START TRANSACTION;

    INSERT INTO AVALIACAO (cod_ocorrencia, cod_servico, cod_morador, nota_serv, nota_tempo, opiniao)
    VALUES (p_cod_ocorrencia, p_cod_servico, p_cod_morador, p_nota_serv, p_nota_tempo, p_opiniao);

    SET p_novo_cod_aval = LAST_INSERT_ID();

    UPDATE OCORRENCIA
    SET tipo_status = 'AVALIADA'
    WHERE cod_oco = p_cod_ocorrencia;

    COMMIT;
END $$

DELIMITER ;


-- TRIGGERS

DELIMITER $$

CREATE TRIGGER trg_avaliacao_media_after_insert
AFTER INSERT ON AVALIACAO
FOR EACH ROW
BEGIN
    UPDATE SERVICO s
    SET s.nota_media_servico = (
        SELECT AVG((a.nota_serv + a.nota_tempo) / 2.0)
        FROM AVALIACAO a
        WHERE a.cod_servico = NEW.cod_servico
    )
    WHERE s.cod_servico = NEW.cod_servico;
END $$

DELIMITER ;

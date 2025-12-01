USE PROJETO1BD;

-- VIEWS

DROP VIEW IF EXISTS vw_avaliacoes_completas;

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
LEFT JOIN SERVICO s      ON s.cod_servico = a.cod_servico
LEFT JOIN OCORRENCIA o   ON o.cod_oco     = a.cod_ocorrencia
LEFT JOIN ORGAO_PUBLICO org ON org.cod_orgao = s.cod_orgao
LEFT JOIN MORADOR m      ON m.cpf          = a.cpf_morador;


-- PROCEDURES

DROP PROCEDURE IF EXISTS sp_registrar_avaliacao;

DELIMITER $$

CREATE PROCEDURE sp_registrar_avaliacao (
    IN p_cod_ocorrencia INT,
    IN p_cod_servico    INT,
    IN p_cpf_morador    VARCHAR(11),
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

    INSERT INTO AVALIACAO (cod_ocorrencia, cod_servico, cpf_morador, nota_serv, nota_tempo, opiniao)
    VALUES (p_cod_ocorrencia, p_cod_servico, p_cpf_morador, p_nota_serv, p_nota_tempo, p_opiniao);

    SET p_novo_cod_aval = LAST_INSERT_ID();

    UPDATE OCORRENCIA
    SET tipo_status = 'FINALIZADA'
    WHERE cod_oco = p_cod_ocorrencia;

    COMMIT;
END $$

DELIMITER ;


-- TRIGGERS

DROP TRIGGER IF EXISTS trg_avaliacao_media_after_insert;
DROP TRIGGER IF EXISTS trg_avaliacao_media_after_update;
DROP TRIGGER IF EXISTS trg_avaliacao_media_after_delete;
DROP TRIGGER IF EXISTS trg_servico_status_after_insert;
DROP TRIGGER IF EXISTS trg_servico_status_after_update;

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


CREATE TRIGGER trg_avaliacao_media_after_update
AFTER UPDATE ON AVALIACAO
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


CREATE TRIGGER trg_avaliacao_media_after_delete
AFTER DELETE ON AVALIACAO
FOR EACH ROW
BEGIN
    UPDATE SERVICO s
    SET s.nota_media_servico = (
        SELECT AVG((a.nota_serv + a.nota_tempo) / 2.0)
        FROM AVALIACAO a
        WHERE a.cod_servico = OLD.cod_servico
    )
    WHERE s.cod_servico = OLD.cod_servico;
END $$


CREATE TRIGGER trg_servico_status_after_insert
AFTER INSERT ON SERVICO
FOR EACH ROW
BEGIN
    IF NEW.fim_servico IS NULL THEN
        UPDATE OCORRENCIA
        SET tipo_status = 'EM ANDAMENTO'
        WHERE cod_oco = NEW.cod_ocorrencia;
    ELSE
        UPDATE OCORRENCIA
        SET tipo_status = 'FINALIZADA'
        WHERE cod_oco = NEW.cod_ocorrencia;
    END IF;
END $$


CREATE TRIGGER trg_servico_status_after_update
AFTER UPDATE ON SERVICO
FOR EACH ROW
BEGIN
    IF NEW.fim_servico IS NOT NULL AND (OLD.fim_servico IS NULL OR NEW.fim_servico <> OLD.fim_servico) THEN
        UPDATE OCORRENCIA
        SET tipo_status = 'FINALIZADA'
        WHERE cod_oco = NEW.cod_ocorrencia;
    ELSEIF NEW.fim_servico IS NULL AND OLD.fim_servico IS NOT NULL THEN
        UPDATE OCORRENCIA
        SET tipo_status = 'EM ANDAMENTO'
        WHERE cod_oco = NEW.cod_ocorrencia;
    END IF;
END $$

DELIMITER ;

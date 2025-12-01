import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()

_SERVICO_BASE_QUERY = (
    "SELECT \n"
    "\ts.cod_servico,\n"
    "\ts.cod_orgao,\n"
    "\torg.nome AS orgao_nome,\n"
    "\ts.cod_ocorrencia,\n"
    "\toco.tipo_status AS ocorrencia_status,\n"
    "\ts.nome,\n"
    "\ts.descr,\n"
    "\ts.inicio_servico,\n"
    "\ts.fim_servico,\n"
    "\ts.nota_media_servico\n"
    "FROM SERVICO AS s\n"
    "LEFT JOIN ORGAO_PUBLICO AS org ON org.cod_orgao = s.cod_orgao\n"
    "LEFT JOIN OCORRENCIA AS oco ON oco.cod_oco = s.cod_ocorrencia"
)


class ServicoService:
    
    def __init__(self, db_manager: "DatabaseManager") -> None:
        self._db_manager = db_manager


    def list_servicos(self) -> Sequence[dict[str, Any]]:
        sql = f"{_SERVICO_BASE_QUERY}\nORDER BY s.nome"
        return self._db_manager.execute_raw_query(sql)


    def get_servico_by_id(self, cod_servico: int) -> Optional[dict[str, Any]]:
        sql = f"{_SERVICO_BASE_QUERY}\nWHERE s.cod_servico = :cod_servico"
        result = self._db_manager.execute_raw_query(sql, {"cod_servico": cod_servico})
        return result[0] if result else None


    def get_servicos_by_ocorrencia(self, cod_ocorrencia: int) -> Sequence[dict[str, Any]]:
        sql = f"{_SERVICO_BASE_QUERY}\nWHERE s.cod_ocorrencia = :cod_ocorrencia\nORDER BY s.nome"
        return self._db_manager.execute_raw_query(sql, {"cod_ocorrencia": cod_ocorrencia})


    def create_servico(
        self,
        *,
        cod_orgao: int,
        cod_ocorrencia: int,
        nome: str,
        descr: Optional[str],
        inicio_servico: Optional[str],
        fim_servico: Optional[str],
    ) -> dict[str, Any]:
        insert_sql = (
            "INSERT INTO SERVICO (cod_orgao, cod_ocorrencia, nome, descr, inicio_servico, fim_servico) "
            "VALUES (:cod_orgao, :cod_ocorrencia, :nome, :descr, :inicio_servico, :fim_servico)"
        )

        try:
            with self._db_manager.engine.begin() as connection:
                result = connection.execute(
                    text(insert_sql),
                    {
                        "cod_orgao": cod_orgao,
                        "cod_ocorrencia": cod_ocorrencia,
                        "nome": nome,
                        "descr": descr,
                        "inicio_servico": inicio_servico,
                        "fim_servico": fim_servico,
                    },
                )
                cod_servico = result.lastrowid
                if not cod_servico:
                    cod_servico = connection.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()
        except SQLAlchemyError:
            logger.exception("Erro ao criar servico")
            raise

        created = self.get_servico_by_id(int(cod_servico))
        if created is None:
            raise RuntimeError("Servico recem criado nao encontrado")
        return created


    def update_servico(
        self,
        cod_servico: int,
        *,
        cod_orgao: Any = _UNSET,
        cod_ocorrencia: Any = _UNSET,
        nome: Any = _UNSET,
        descr: Any = _UNSET,
        inicio_servico: Any = _UNSET,
        fim_servico: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if cod_orgao is not _UNSET:
            fields_to_update["cod_orgao"] = cod_orgao
        if cod_ocorrencia is not _UNSET:
            fields_to_update["cod_ocorrencia"] = cod_ocorrencia
        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if descr is not _UNSET:
            fields_to_update["descr"] = descr
        if inicio_servico is not _UNSET:
            fields_to_update["inicio_servico"] = inicio_servico
        if fim_servico is not _UNSET:
            fields_to_update["fim_servico"] = fim_servico

        if fields_to_update:
            try:
                with self._db_manager.engine.begin() as connection:
                    set_clause = ", ".join(
                        f"{column} = :{column}" for column in fields_to_update
                    )
                    params = {**fields_to_update, "cod_servico": cod_servico}
                    connection.execute(
                        text(
                            f"UPDATE SERVICO SET {set_clause} "
                            "WHERE cod_servico = :cod_servico"
                        ),
                        params,
                    )
            except SQLAlchemyError:
                logger.exception("Erro ao atualizar servico %s", cod_servico)
                raise

        return self.get_servico_by_id(cod_servico)


    def delete_servico(self, cod_servico: int) -> None:
        try:
            with self._db_manager.engine.begin() as connection:
                connection.execute(
                    text("DELETE FROM SERVICO WHERE cod_servico = :cod_servico"),
                    {"cod_servico": cod_servico},
                )
        except SQLAlchemyError:
            logger.exception("Erro ao deletar servico %s", cod_servico)
            raise

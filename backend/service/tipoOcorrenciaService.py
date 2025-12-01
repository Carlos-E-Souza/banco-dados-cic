import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()

_TIPO_BASE_QUERY = (
    "SELECT \n"
    "\ttipo.cod_tipo,\n"
    "\ttipo.nome,\n"
    "\ttipo.descr,\n"
    "\ttipo.orgao_pub,\n"
    "\torg.nome AS orgao_nome,\n"
    "\torg.estado AS orgao_estado\n"
    "FROM TIPO_OCORRENCIA AS tipo\n"
    "LEFT JOIN ORGAO_PUBLICO AS org ON org.cod_orgao = tipo.orgao_pub"
)


class TipoOcorrenciaService:
    
    def __init__(self, db_manager: "DatabaseManager") -> None:
        self._db_manager = db_manager


    def list_tipos_ocorrencia(self) -> Sequence[dict[str, Any]]:
        sql = f"{_TIPO_BASE_QUERY}\nORDER BY tipo.nome"
        return self._db_manager.execute_raw_query(sql)


    def get_tipo_by_id(self, cod_tipo: int) -> Optional[dict[str, Any]]:
        sql = f"{_TIPO_BASE_QUERY}\nWHERE tipo.cod_tipo = :cod_tipo"
        result = self._db_manager.execute_raw_query(sql, {"cod_tipo": cod_tipo})
        return result[0] if result else None


    def create_tipo_ocorrencia(
        self,
        *,
        nome: str,
        descr: Optional[str],
        orgao_pub: int,
    ) -> dict[str, Any]:
        insert_sql = (
            "INSERT INTO TIPO_OCORRENCIA (nome, descr, orgao_pub) "
            "VALUES (:nome, :descr, :orgao_pub)"
        )

        try:
            with self._db_manager.engine.begin() as connection:
                result = connection.execute(
                    text(insert_sql),
                    {"nome": nome, "descr": descr, "orgao_pub": orgao_pub},
                )
                cod_tipo = result.lastrowid
                if not cod_tipo:
                    cod_tipo = connection.execute(text("SELECT LAST_INSERT_ID()"))
                    cod_tipo = cod_tipo.scalar_one()
        except SQLAlchemyError:
            logger.exception("Erro ao criar tipo de ocorrencia")
            raise

        created = self.get_tipo_by_id(int(cod_tipo))
        if created is None:
            raise RuntimeError("Tipo de ocorrencia recem criado nao encontrado")
        return created


    def update_tipo_ocorrencia(
        self,
        cod_tipo: int,
        *,
        nome: Any = _UNSET,
        descr: Any = _UNSET,
        orgao_pub: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if descr is not _UNSET:
            fields_to_update["descr"] = descr
        if orgao_pub is not _UNSET:
            fields_to_update["orgao_pub"] = orgao_pub

        if fields_to_update:
            try:
                with self._db_manager.engine.begin() as connection:
                    set_clause = ", ".join(
                        f"{column} = :{column}" for column in fields_to_update
                    )
                    params = {**fields_to_update, "cod_tipo": cod_tipo}
                    connection.execute(
                        text(
                            f"UPDATE TIPO_OCORRENCIA SET {set_clause} "
                            "WHERE cod_tipo = :cod_tipo"
                        ),
                        params,
                    )
            except SQLAlchemyError:
                logger.exception("Erro ao atualizar tipo de ocorrencia %s", cod_tipo)
                raise

        return self.get_tipo_by_id(cod_tipo)


    def delete_tipo_ocorrencia(self, cod_tipo: int) -> None:
        try:
            with self._db_manager.engine.begin() as connection:
                connection.execute(
                    text("DELETE FROM TIPO_OCORRENCIA WHERE cod_tipo = :cod_tipo"),
                    {"cod_tipo": cod_tipo},
                )
        except SQLAlchemyError:
            logger.exception("Erro ao deletar tipo de ocorrencia %s", cod_tipo)
            raise

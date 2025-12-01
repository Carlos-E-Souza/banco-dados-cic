import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()

_ORGAO_BASE_QUERY = (
    "SELECT \n"
    "\torgao.cod_orgao,\n"
    "\torgao.nome,\n"
    "\torgao.estado,\n"
    "\torgao.descr,\n"
    "\torgao.data_ini,\n"
    "\torgao.data_fim\n"
    "FROM ORGAO_PUBLICO AS orgao"
)


class OrgaoPublicoService:
    
    def __init__(self, db_manager: "DatabaseManager") -> None:
        self._db_manager = db_manager


    def list_orgaos_publicos(self) -> Sequence[dict[str, Any]]:
        sql = f"{_ORGAO_BASE_QUERY}\nORDER BY orgao.nome"
        return self._db_manager.execute_raw_query(sql)


    def get_orgao_by_id(self, cod_orgao: int) -> Optional[dict[str, Any]]:
        sql = f"{_ORGAO_BASE_QUERY}\nWHERE orgao.cod_orgao = :cod_orgao"
        result = self._db_manager.execute_raw_query(sql, {"cod_orgao": cod_orgao})
        return result[0] if result else None


    def create_orgao_publico(
        self,
        *,
        nome: str,
        estado: str,
        data_ini: str,
        descr: Optional[str],
        data_fim: Optional[str],
    ) -> dict[str, Any]:
        insert_sql = (
            "INSERT INTO ORGAO_PUBLICO (nome, estado, descr, data_ini, data_fim) "
            "VALUES (:nome, :estado, :descr, :data_ini, :data_fim)"
        )

        try:
            with self._db_manager.engine.begin() as connection:
                result = connection.execute(
                    text(insert_sql),
                    {
                        "nome": nome,
                        "estado": estado,
                        "descr": descr,
                        "data_ini": data_ini,
                        "data_fim": data_fim,
                    },
                )
                cod_orgao = result.lastrowid
                if not cod_orgao:
                    cod_orgao = connection.execute(text("SELECT LAST_INSERT_ID()"))
                    cod_orgao = cod_orgao.scalar_one()
        except SQLAlchemyError:
            logger.exception("Erro ao criar orgao publico")
            raise

        created = self.get_orgao_by_id(int(cod_orgao))
        if created is None:
            raise RuntimeError("Orgao publico recem criado nao encontrado")
        return created


    def update_orgao_publico(
        self,
        cod_orgao: int,
        *,
        nome: Any = _UNSET,
        estado: Any = _UNSET,
        descr: Any = _UNSET,
        data_ini: Any = _UNSET,
        data_fim: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if estado is not _UNSET:
            fields_to_update["estado"] = estado
        if descr is not _UNSET:
            fields_to_update["descr"] = descr
        if data_ini is not _UNSET:
            fields_to_update["data_ini"] = data_ini
        if data_fim is not _UNSET:
            fields_to_update["data_fim"] = data_fim

        if fields_to_update:
            try:
                with self._db_manager.engine.begin() as connection:
                    set_clause = ", ".join(
                        f"{column} = :{column}" for column in fields_to_update
                    )
                    params = {**fields_to_update, "cod_orgao": cod_orgao}
                    connection.execute(
                        text(
                            f"UPDATE ORGAO_PUBLICO SET {set_clause} "
                            "WHERE cod_orgao = :cod_orgao"
                        ),
                        params,
                    )
            except SQLAlchemyError:
                logger.exception("Erro ao atualizar orgao publico %s", cod_orgao)
                raise

        return self.get_orgao_by_id(cod_orgao)


    def delete_orgao_publico(self, cod_orgao: int) -> None:
        try:
            with self._db_manager.engine.begin() as connection:
                connection.execute(
                    text("DELETE FROM ORGAO_PUBLICO WHERE cod_orgao = :cod_orgao"),
                    {"cod_orgao": cod_orgao},
                )
        except SQLAlchemyError:
            logger.exception("Erro ao deletar orgao publico %s", cod_orgao)
            raise

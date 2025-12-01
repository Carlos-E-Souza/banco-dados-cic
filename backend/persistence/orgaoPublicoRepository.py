from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text

from .databaseManager import DatabaseManager

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


class OrgaoPublicoRepository:

    def __init__(self, db_manager: DatabaseManager) -> None:
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
        descr: Optional[str],
        data_ini: str,
        data_fim: Optional[str],
    ) -> int:
        insert_sql = (
            "INSERT INTO ORGAO_PUBLICO (nome, estado, descr, data_ini, data_fim) "
            "VALUES (:nome, :estado, :descr, :data_ini, :data_fim)"
        )

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
                cod_orgao_result = connection.execute(text("SELECT LAST_INSERT_ID()"))
                cod_orgao = cod_orgao_result.scalar_one()

        return int(cod_orgao)


    def update_orgao_publico(self, cod_orgao: int, fields_to_update: Dict[str, Any]) -> None:
        if not fields_to_update:
            return

        with self._db_manager.engine.begin() as connection:
            set_clause = ", ".join(f"{column} = :{column}" for column in fields_to_update)
            params = {**fields_to_update, "cod_orgao": cod_orgao}
            connection.execute(
                text(
                    f"UPDATE ORGAO_PUBLICO SET {set_clause} "
                    "WHERE cod_orgao = :cod_orgao"
                ),
                params,
            )


    def delete_orgao_publico(self, cod_orgao: int) -> None:
        with self._db_manager.engine.begin() as connection:
            connection.execute(
                text("DELETE FROM ORGAO_PUBLICO WHERE cod_orgao = :cod_orgao"),
                {"cod_orgao": cod_orgao},
            )

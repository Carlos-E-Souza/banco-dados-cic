from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text

from .databaseManager import DatabaseManager

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


class TipoOcorrenciaRepository:

    def __init__(self, db_manager: DatabaseManager) -> None:
        self._db_manager = db_manager


    def list_tipos_ocorrencia(self) -> Sequence[dict[str, Any]]:
        sql = f"{_TIPO_BASE_QUERY}\nORDER BY tipo.nome"
        return self._db_manager.execute_raw_query(sql)


    def get_tipo_by_id(self, cod_tipo: int) -> Optional[dict[str, Any]]:
        sql = f"{_TIPO_BASE_QUERY}\nWHERE tipo.cod_tipo = :cod_tipo"
        result = self._db_manager.execute_raw_query(sql, {"cod_tipo": cod_tipo})
        return result[0] if result else None


    def create_tipo_ocorrencia(self, *, nome: str, descr: Optional[str], orgao_pub: int) -> int:
        insert_sql = (
            "INSERT INTO TIPO_OCORRENCIA (nome, descr, orgao_pub) "
            "VALUES (:nome, :descr, :orgao_pub)"
        )

        with self._db_manager.engine.begin() as connection:
            result = connection.execute(
                text(insert_sql),
                {"nome": nome, "descr": descr, "orgao_pub": orgao_pub},
            )
            cod_tipo = result.lastrowid
            if not cod_tipo:
                cod_tipo_result = connection.execute(text("SELECT LAST_INSERT_ID()"))
                cod_tipo = cod_tipo_result.scalar_one()

        return int(cod_tipo)


    def update_tipo_ocorrencia(self, cod_tipo: int, fields_to_update: Dict[str, Any]) -> None:
        if not fields_to_update:
            return

        with self._db_manager.engine.begin() as connection:
            set_clause = ", ".join(f"{column} = :{column}" for column in fields_to_update)
            params = {**fields_to_update, "cod_tipo": cod_tipo}
            connection.execute(
                text(
                    f"UPDATE TIPO_OCORRENCIA SET {set_clause} "
                    "WHERE cod_tipo = :cod_tipo"
                ),
                params,
            )


    def delete_tipo_ocorrencia(self, cod_tipo: int) -> None:
        with self._db_manager.engine.begin() as connection:
            connection.execute(
                text("DELETE FROM TIPO_OCORRENCIA WHERE cod_tipo = :cod_tipo"),
                {"cod_tipo": cod_tipo},
            )

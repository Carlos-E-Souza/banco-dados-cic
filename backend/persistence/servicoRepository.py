from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text

from .databaseManager import DatabaseManager

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


class ServicoRepository:

    def __init__(self, db_manager: DatabaseManager) -> None:
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
    ) -> int:
        insert_sql = (
            "INSERT INTO SERVICO (cod_orgao, cod_ocorrencia, nome, descr, inicio_servico, fim_servico) "
            "VALUES (:cod_orgao, :cod_ocorrencia, :nome, :descr, :inicio_servico, :fim_servico)"
        )

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

        return int(cod_servico)


    def update_servico(self, cod_servico: int, fields_to_update: Dict[str, Any]) -> None:
        if not fields_to_update:
            return

        with self._db_manager.engine.begin() as connection:
            set_clause = ", ".join(f"{column} = :{column}" for column in fields_to_update)
            params = {**fields_to_update, "cod_servico": cod_servico}
            connection.execute(
                text(
                    f"UPDATE SERVICO SET {set_clause} "
                    "WHERE cod_servico = :cod_servico"
                ),
                params,
            )


    def delete_servico(self, cod_servico: int) -> None:
        with self._db_manager.engine.begin() as connection:
            connection.execute(
                text("DELETE FROM SERVICO WHERE cod_servico = :cod_servico"),
                {"cod_servico": cod_servico},
            )

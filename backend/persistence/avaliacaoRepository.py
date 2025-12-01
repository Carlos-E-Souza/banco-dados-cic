from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.engine import Connection

from .databaseManager import DatabaseManager

_AVALIACAO_VIEW_BASE_QUERY = (
    "SELECT \n"
    "\tcod_aval,\n"
    "\tcod_oco AS cod_ocorrencia,\n"
    "\tcod_servico,\n"
    "\tmorador_cpf AS cpf_morador,\n"
    "\tnota_serv,\n"
    "\tnota_tempo,\n"
    "\topiniao,\n"
    "\ttipo_status AS ocorrencia_status,\n"
    "\tservico_nome,\n"
    "\torgao_nome,\n"
    "\tmorador_nome,\n"
    "\tservico_descr,\n"
    "\tdata_ocorrencia,\n"
    "\tinicio_servico,\n"
    "\tfim_servico\n"
    "FROM vw_avaliacoes_completas"
)


class AvaliacaoRepository:

    def __init__(self, db_manager: DatabaseManager) -> None:
        self._db_manager = db_manager


    def list_avaliacoes(self) -> Sequence[dict[str, Any]]:
        sql = f"{_AVALIACAO_VIEW_BASE_QUERY}\nORDER BY cod_aval DESC"
        return self._db_manager.execute_raw_query(sql)


    def get_avaliacao_by_id(self, cod_aval: int) -> Optional[dict[str, Any]]:
        sql = f"{_AVALIACAO_VIEW_BASE_QUERY}\nWHERE cod_aval = :cod_aval"
        result = self._db_manager.execute_raw_query(sql, {"cod_aval": cod_aval})
        return result[0] if result else None


    def get_avaliacao_by_ocorrencia(self, cod_ocorrencia: int) -> Optional[dict[str, Any]]:
        sql = f"{_AVALIACAO_VIEW_BASE_QUERY}\nWHERE cod_oco = :cod_ocorrencia"
        result = self._db_manager.execute_raw_query(sql, {"cod_ocorrencia": cod_ocorrencia})
        return result[0] if result else None


    def create_avaliacao(
        self,
        *,
        cod_ocorrencia: int,
        cod_servico: int,
        cpf_morador: str,
        nota_serv: int,
        nota_tempo: int,
        opiniao: Optional[str],
    ) -> int:
        with self._db_manager.engine.begin() as connection:
            return self._call_registrar_avaliacao(
                connection,
                cod_ocorrencia=cod_ocorrencia,
                cod_servico=cod_servico,
                cpf_morador=cpf_morador,
                nota_serv=nota_serv,
                nota_tempo=nota_tempo,
                opiniao=opiniao,
            )


    def update_avaliacao(self, cod_aval: int, fields_to_update: Dict[str, Any]) -> None:
        if not fields_to_update:
            return

        with self._db_manager.engine.begin() as connection:
            set_clause = ", ".join(f"{column} = :{column}" for column in fields_to_update)
            params = {**fields_to_update, "cod_aval": cod_aval}
            connection.execute(
                text(
                    f"UPDATE AVALIACAO SET {set_clause} "
                    "WHERE cod_aval = :cod_aval"
                ),
                params,
            )


    def delete_avaliacao(self, cod_aval: int) -> None:
        with self._db_manager.engine.begin() as connection:
            connection.execute(
                text("DELETE FROM AVALIACAO WHERE cod_aval = :cod_aval"),
                {"cod_aval": cod_aval},
            )


    def _call_registrar_avaliacao(
        self,
        connection: Connection,
        *,
        cod_ocorrencia: int,
        cod_servico: int,
        cpf_morador: str,
        nota_serv: int,
        nota_tempo: int,
        opiniao: Optional[str],
    ) -> int:
        result = connection.execute(
            text(
                "CALL sp_registrar_avaliacao(:cod_ocorrencia, :cod_servico, :cpf_morador, "
                ":nota_serv, :nota_tempo, :opiniao, @novo_cod_aval)"
            ),
            {
                "cod_ocorrencia": cod_ocorrencia,
                "cod_servico": cod_servico,
                "cpf_morador": cpf_morador,
                "nota_serv": nota_serv,
                "nota_tempo": nota_tempo,
                "opiniao": opiniao,
            },
        )
        result.close()
        cod_aval = connection.execute(text("SELECT @novo_cod_aval"))
        cod_value = cod_aval.scalar_one()
        if cod_value is None:
            raise RuntimeError("Procedure sp_registrar_avaliacao nao retornou identificador")
        return int(cod_value)

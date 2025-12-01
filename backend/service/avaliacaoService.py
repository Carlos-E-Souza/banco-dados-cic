import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()

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


class AvaliacaoService:

    def __init__(self, db_manager: "DatabaseManager") -> None:
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
    ) -> dict[str, Any]:
        try:
            with self._db_manager.engine.begin() as connection:
                cod_aval = self._call_registrar_avaliacao(
                    connection,
                    cod_ocorrencia=cod_ocorrencia,
                    cod_servico=cod_servico,
                    cpf_morador=cpf_morador,
                    nota_serv=nota_serv,
                    nota_tempo=nota_tempo,
                    opiniao=opiniao,
                )
        except SQLAlchemyError:
            logger.exception("Erro ao registrar avaliacao")
            raise

        created = self.get_avaliacao_by_id(cod_aval)
        if created is None:
            raise RuntimeError("Avaliacao recem criada nao encontrada")
        return created


    def update_avaliacao(
        self,
        cod_aval: int,
        *,
        cod_ocorrencia: Any = _UNSET,
        cod_servico: Any = _UNSET,
        cpf_morador: Any = _UNSET,
        nota_serv: Any = _UNSET,
        nota_tempo: Any = _UNSET,
        opiniao: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if cod_ocorrencia is not _UNSET:
            fields_to_update["cod_ocorrencia"] = cod_ocorrencia
        if cod_servico is not _UNSET:
            fields_to_update["cod_servico"] = cod_servico
        if cpf_morador is not _UNSET:
            fields_to_update["cpf_morador"] = cpf_morador
        if nota_serv is not _UNSET:
            fields_to_update["nota_serv"] = nota_serv
        if nota_tempo is not _UNSET:
            fields_to_update["nota_tempo"] = nota_tempo
        if opiniao is not _UNSET:
            fields_to_update["opiniao"] = opiniao

        if fields_to_update:
            try:
                with self._db_manager.engine.begin() as connection:
                    set_clause = ", ".join(
                        f"{column} = :{column}" for column in fields_to_update
                    )
                    params = {**fields_to_update, "cod_aval": cod_aval}
                    connection.execute(
                        text(
                            f"UPDATE AVALIACAO SET {set_clause} "
                            "WHERE cod_aval = :cod_aval"
                        ),
                        params,
                    )

            except SQLAlchemyError:
                logger.exception("Erro ao atualizar avaliacao %s", cod_aval)
                raise

        return self.get_avaliacao_by_id(cod_aval)


    def delete_avaliacao(self, cod_aval: int) -> None:
        try:
            with self._db_manager.engine.begin() as connection:
                connection.execute(
                    text("DELETE FROM AVALIACAO WHERE cod_aval = :cod_aval"),
                    {"cod_aval": cod_aval},
                )

        except SQLAlchemyError:
            logger.exception("Erro ao deletar avaliacao %s", cod_aval)
            raise


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

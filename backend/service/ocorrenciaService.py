import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()

_OCORRENCIA_BASE_QUERY = (
    "SELECT \n"
    "\to.cod_oco,\n"
    "\to.cod_tipo,\n"
    "\ttipo.nome AS tipo_nome,\n"
    "\ttipo.descr AS tipo_descr,\n"
    "\to.cod_local,\n"
    "\tloc.estado,\n"
    "\tloc.cidade,\n"
    "\tloc.bairro,\n"
    "\to.endereco,\n"
    "\to.cpf_morador,\n"
    "\tmor.nome AS morador_nome,\n"
    "\to.data,\n"
    "\to.tipo_status,\n"
    "\to.descr\n"
    "FROM OCORRENCIA AS o\n"
    "LEFT JOIN TIPO_OCORRENCIA AS tipo ON tipo.cod_tipo = o.cod_tipo\n"
    "LEFT JOIN LOCALIDADE AS loc ON loc.cod_local = o.cod_local\n"
    "LEFT JOIN MORADOR AS mor ON mor.cpf = o.cpf_morador"
)


class OcorrenciaService:
    
    def __init__(self, db_manager: "DatabaseManager") -> None:
        self._db_manager = db_manager


    def list_ocorrencias(self) -> Sequence[dict[str, Any]]:
        sql = f"{_OCORRENCIA_BASE_QUERY}\nORDER BY o.data DESC, o.cod_oco DESC"
        return self._db_manager.execute_raw_query(sql)


    def list_ocorrencias_by_morador(self, cpf: str) -> Sequence[dict[str, Any]]:
        sql = f"{_OCORRENCIA_BASE_QUERY}\nWHERE o.cpf_morador = :cpf\nORDER BY o.data DESC, o.cod_oco DESC"
        return self._db_manager.execute_raw_query(sql, {"cpf": cpf})


    def get_ocorrencia_by_id(self, cod_oco: int) -> Optional[dict[str, Any]]:
        sql = f"{_OCORRENCIA_BASE_QUERY}\nWHERE o.cod_oco = :cod_oco"
        result = self._db_manager.execute_raw_query(sql, {"cod_oco": cod_oco})
        return result[0] if result else None


    def create_ocorrencia(
        self,
        *,
        cod_tipo: int,
        cpf_morador: str,
        endereco: str,
        data: str,
        tipo_status: str,
        descr: Optional[str],
        cod_local: Optional[int] = None,
        localidade: Optional[Dict[str, str]] = None,
    ) -> dict[str, Any]:
        try:
            with self._db_manager.engine.begin() as connection:
                target_cod_local = self._resolve_localidade(
                    connection,
                    cod_local=cod_local,
                    localidade=localidade,
                )

                insert_payload = {
                    "cod_tipo": cod_tipo,
                    "cpf_morador": cpf_morador,
                    "cod_local": target_cod_local,
                    "endereco": endereco,
                    "data": data,
                    "tipo_status": tipo_status,
                    "descr": descr,
                }

                result = connection.execute(
                    text(
                        "INSERT INTO OCORRENCIA (cod_tipo, cpf_morador, cod_local, endereco, data, tipo_status, descr) "
                        "VALUES (:cod_tipo, :cpf_morador, :cod_local, :endereco, :data, :tipo_status, :descr)"
                    ),
                    insert_payload,
                )

                cod_oco = result.lastrowid
                if not cod_oco:
                    cod_oco = connection.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()
        except SQLAlchemyError:
            logger.exception("Erro ao criar ocorrencia")
            raise

        created = self.get_ocorrencia_by_id(int(cod_oco))
        if created is None:
            raise RuntimeError("Ocorrencia recem criada nao encontrada")
        return created


    def update_ocorrencia(
        self,
        cod_oco: int,
        *,
        cod_tipo: Any = _UNSET,
        cpf_morador: Any = _UNSET,
        endereco: Any = _UNSET,
        data: Any = _UNSET,
        tipo_status: Any = _UNSET,
        descr: Any = _UNSET,
        cod_local: Any = _UNSET,
        localidade: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        try:
            with self._db_manager.engine.begin() as connection:
                fields_to_update: Dict[str, Any] = {}

                if cod_tipo is not _UNSET:
                    fields_to_update["cod_tipo"] = cod_tipo
                if cpf_morador is not _UNSET:
                    fields_to_update["cpf_morador"] = cpf_morador
                if endereco is not _UNSET:
                    fields_to_update["endereco"] = endereco
                if data is not _UNSET:
                    fields_to_update["data"] = data
                if tipo_status is not _UNSET:
                    fields_to_update["tipo_status"] = tipo_status
                if descr is not _UNSET:
                    fields_to_update["descr"] = descr

                if cod_local is not _UNSET or localidade is not _UNSET:
                    resolved_cod_local = self._resolve_localidade(
                        connection,
                        cod_local=None if cod_local is _UNSET else cod_local,
                        localidade=None if localidade is _UNSET else localidade,
                    )
                    fields_to_update["cod_local"] = resolved_cod_local

                if fields_to_update:
                    set_clause = ", ".join(
                        f"{column} = :{column}" for column in fields_to_update
                    )
                    params = {**fields_to_update, "cod_oco": cod_oco}
                    connection.execute(
                        text(f"UPDATE OCORRENCIA SET {set_clause} WHERE cod_oco = :cod_oco"),
                        params,
                    )
        except SQLAlchemyError:
            logger.exception("Erro ao atualizar ocorrencia %s", cod_oco)
            raise

        return self.get_ocorrencia_by_id(cod_oco)


    def delete_ocorrencia(self, cod_oco: int) -> None:
        try:
            with self._db_manager.engine.begin() as connection:
                connection.execute(
                    text("DELETE FROM OCORRENCIA WHERE cod_oco = :cod_oco"),
                    {"cod_oco": cod_oco},
                )
        except SQLAlchemyError:
            logger.exception("Erro ao deletar ocorrencia %s", cod_oco)
            raise


    def _resolve_localidade(
        self,
        connection: Connection,
        *,
        cod_local: Optional[int],
        localidade: Optional[Dict[str, str]],
    ) -> int:
        if cod_local is not None:
            return cod_local

        if not localidade:
            raise ValueError("Localidade deve ser informada quando cod_local nao for fornecido")

        required_keys = {"estado", "cidade", "bairro"}
        missing = required_keys - set(localidade.keys())
        if missing:
            missing_fields = ", ".join(sorted(missing))
            raise ValueError(f"Campos de localidade ausentes: {missing_fields}")

        select_sql = text(
            "SELECT cod_local FROM LOCALIDADE "
            "WHERE estado = :estado AND cidade = :cidade AND bairro = :bairro "
            "LIMIT 1"
        )
        params = {
            "estado": localidade["estado"],
            "cidade": localidade["cidade"],
            "bairro": localidade["bairro"],
        }

        result = connection.execute(select_sql, params).first()
        if result:
            return int(result[0])

        insert_sql = text(
            "INSERT INTO LOCALIDADE (estado, cidade, bairro) "
            "VALUES (:estado, :cidade, :bairro)"
        )
        insert_result = connection.execute(insert_sql, params)
        new_id = insert_result.lastrowid
        if not new_id:
            new_id = connection.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()
        return int(new_id)

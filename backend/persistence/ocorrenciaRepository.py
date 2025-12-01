from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.engine import Connection

from .databaseManager import DatabaseManager

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


class OcorrenciaRepository:

    def __init__(self, db_manager: DatabaseManager) -> None:
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
        cod_local: Optional[int],
        endereco: str,
        data: str,
        tipo_status: str,
        descr: Optional[str],
        localidade: Optional[Dict[str, str]],
    ) -> int:
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

        return int(cod_oco)


    def update_ocorrencia(
        self,
        cod_oco: int,
        *,
        fields_to_update: Dict[str, Any],
        cod_local: Optional[int],
        update_cod_local: bool,
        localidade: Optional[Dict[str, str]],
        update_localidade: bool,
    ) -> None:
        with self._db_manager.engine.begin() as connection:
            updates = dict(fields_to_update)

            if update_cod_local or update_localidade:
                resolved_cod_local = self._resolve_localidade(
                    connection,
                    cod_local=cod_local if update_cod_local else None,
                    localidade=localidade if update_localidade else None,
                )
                updates["cod_local"] = resolved_cod_local

            if updates:
                set_clause = ", ".join(f"{column} = :{column}" for column in updates)
                params = {**updates, "cod_oco": cod_oco}
                connection.execute(
                    text(f"UPDATE OCORRENCIA SET {set_clause} WHERE cod_oco = :cod_oco"),
                    params,
                )


    def delete_ocorrencia(self, cod_oco: int) -> None:
        with self._db_manager.engine.begin() as connection:
            connection.execute(
                text("DELETE FROM OCORRENCIA WHERE cod_oco = :cod_oco"),
                {"cod_oco": cod_oco},
            )


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

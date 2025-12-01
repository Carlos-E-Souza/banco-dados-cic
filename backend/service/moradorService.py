import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()

_MORADOR_BASE_QUERY = (
    "SELECT \n"
    "\tm.cpf,\n"
    "\tm.nome,\n"
    "\tm.cod_local,\n"
    "\tm.endereco,\n"
    "\tm.data_nasc,\n"
    "\tloc.estado,\n"
    "\tloc.cidade,\n"
    "\tloc.bairro,\n"
    "\tem.email,\n"
    "\ttel.telefone,\n"
    "\ttel.DDD AS ddd\n"
    "FROM MORADOR AS m\n"
    "LEFT JOIN LOCALIDADE AS loc ON loc.cod_local = m.cod_local\n"
    "LEFT JOIN EMAIL AS em ON em.cpf_morador = m.cpf\n"
    "LEFT JOIN TELEFONE AS tel ON tel.cpf_morador = m.cpf"
)


class MoradorService:
    
    def __init__(self, db_manager: "DatabaseManager") -> None:
        self._db_manager = db_manager


    def list_moradores(self) -> Sequence[dict[str, Any]]:
        sql = f"{_MORADOR_BASE_QUERY}\nORDER BY m.nome"
        return self._db_manager.execute_raw_query(sql)


    def get_morador_by_cpf(self, cpf: str) -> Optional[dict[str, Any]]:
        sql = f"{_MORADOR_BASE_QUERY}\nWHERE m.cpf = :cpf"
        result = self._db_manager.execute_raw_query(sql, {"cpf": cpf})
        return result[0] if result else None


    def authenticate(self, email: str, senha: str) -> Optional[dict[str, Any]]:
        sql = (
            "SELECT "
            "\tm.cpf, "
            "\tm.nome, "
            "\tm.senha "
            "FROM MORADOR AS m "
            "JOIN EMAIL AS em ON em.cpf_morador = m.cpf "
            "WHERE em.email = :email"
        )
        result = self._db_manager.execute_raw_query(sql, {"email": email})
        if not result:
            return None

        record = result[0]
        if record.get("senha") != senha:
            return None

        return {
            "cpf": record["cpf"],
            "nome": record["nome"],
            "email": email,
        }


    def create_morador(
        self,
        *,
        cpf: str,
        nome: str,
        endereco: str,
        data_nasc: str,
        senha: str,
        cod_local: Optional[int] = None,
        localidade: Optional[Dict[str, str]] = None,
        email: Optional[str] = None,
        telefone: Optional[str] = None,
        ddd: Optional[str] = None,
    ) -> dict[str, Any]:
        try:
            with self._db_manager.engine.begin() as connection:
                target_cod_local = self._resolve_localidade(
                    connection,
                    cod_local=cod_local,
                    localidade=localidade,
                )

                payload = {
                    "cpf": cpf,
                    "nome": nome,
                    "cod_local": target_cod_local,
                    "endereco": endereco,
                    "data_nasc": data_nasc,
                    "senha": senha,
                }

                connection.execute(
                    text(
                        "INSERT INTO MORADOR (cpf, nome, cod_local, endereco, data_nasc, senha) "
                        "VALUES (:cpf, :nome, :cod_local, :endereco, :data_nasc, :senha)"
                    ),
                    payload,
                )

                self._sync_email(connection, cpf, email)
                self._sync_telefone(connection, cpf, telefone, ddd)
        except SQLAlchemyError:
            logger.exception("Erro ao criar morador %s", cpf)
            raise

        created = self.get_morador_by_cpf(cpf)
        if created is None:
            raise RuntimeError("Morador recem criado nao encontrado")
        return created


    def update_morador(
        self,
        cpf: str,
        *,
        nome: Any = _UNSET,
        endereco: Any = _UNSET,
        data_nasc: Any = _UNSET,
        senha: Any = _UNSET,
        cod_local: Any = _UNSET,
        localidade: Any = _UNSET,
        email: Any = _UNSET,
        telefone: Any = _UNSET,
        ddd: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        try:
            with self._db_manager.engine.begin() as connection:
                fields_to_update: Dict[str, Any] = {}

                if nome is not _UNSET:
                    fields_to_update["nome"] = nome
                if endereco is not _UNSET:
                    fields_to_update["endereco"] = endereco
                if data_nasc is not _UNSET:
                    fields_to_update["data_nasc"] = data_nasc
                if senha is not _UNSET:
                    fields_to_update["senha"] = senha

                if cod_local is not _UNSET or localidade is not _UNSET:
                    resolved_cod_local = self._resolve_localidade(
                        connection,
                        cod_local=None if cod_local is _UNSET else cod_local,
                        localidade=None if localidade is _UNSET else localidade,
                    )
                    fields_to_update["cod_local"] = resolved_cod_local

                if fields_to_update:
                    set_clause = ", ".join(
                        f"{column} = :{column}" for column in fields_to_update.keys()
                    )
                    params = {**fields_to_update, "cpf": cpf}
                    connection.execute(
                        text(f"UPDATE MORADOR SET {set_clause} WHERE cpf = :cpf"),
                        params,
                    )

                self._sync_email(connection, cpf, email)
                self._sync_telefone(connection, cpf, telefone, ddd)
        except SQLAlchemyError:
            logger.exception("Erro ao atualizar morador %s", cpf)
            raise

        return self.get_morador_by_cpf(cpf)


    def delete_morador(self, cpf: str) -> None:
        try:
            with self._db_manager.engine.begin() as connection:
                connection.execute(
                    text("DELETE FROM MORADOR WHERE cpf = :cpf"),
                    {"cpf": cpf},
                )
        except SQLAlchemyError:
            logger.exception("Erro ao deletar morador %s", cpf)
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


    def _sync_email(self, connection: Connection, cpf: str, email: Any) -> None:
        if email is _UNSET:
            return

        connection.execute(
            text("DELETE FROM EMAIL WHERE cpf_morador = :cpf"),
            {"cpf": cpf},
        )

        if email:
            connection.execute(
                text("INSERT INTO EMAIL (cpf_morador, email) VALUES (:cpf, :email)"),
                {"cpf": cpf, "email": email},
            )


    def _sync_telefone(self, connection: Connection, cpf: str, telefone: Any, ddd: Any) -> None:
        if telefone is _UNSET and ddd is _UNSET:
            return

        existing: Optional[Dict[str, Any]] = None
        if telefone is _UNSET or ddd is _UNSET:
            row = connection.execute(
                text(
                    "SELECT telefone, DDD FROM TELEFONE WHERE cpf_morador = :cpf LIMIT 1"
                ),
                {"cpf": cpf},
            ).first()
            if row:
                existing = {"telefone": row[0], "ddd": row[1]}

        connection.execute(
            text("DELETE FROM TELEFONE WHERE cpf_morador = :cpf"),
            {"cpf": cpf},
        )

        telefone_value = (
            telefone
            if telefone is not _UNSET
            else (existing["telefone"] if existing else None)
        )
        ddd_value = (
            ddd
            if ddd is not _UNSET
            else (existing["ddd"] if existing else None)
        )

        if telefone_value:
            connection.execute(
                text(
                    "INSERT INTO TELEFONE (telefone, cpf_morador, DDD) "
                    "VALUES (:telefone, :cpf, :ddd)"
                ),
                {"telefone": telefone_value, "cpf": cpf, "ddd": ddd_value},
            )

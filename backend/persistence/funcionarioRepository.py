from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.engine import Connection

from .databaseManager import DatabaseManager

_FUNCIONARIO_BASE_QUERY = (
    "SELECT \n"
    "\tf.cpf,\n"
    "\tf.nome,\n"
    "\tf.orgao_pub,\n"
    "\torg.nome AS orgao_nome,\n"
    "\tf.cargo,\n"
    "\tcg.nome AS cargo_nome,\n"
    "\tf.data_nasc,\n"
    "\tf.inicio_contrato,\n"
    "\tf.fim_contrato,\n"
    "\tft.imagem AS foto,\n"
    "\tem.email\n"
    "FROM FUNCIONARIO AS f\n"
    "LEFT JOIN ORGAO_PUBLICO AS org ON org.cod_orgao = f.orgao_pub\n"
    "LEFT JOIN CARGO AS cg ON cg.cod_cargo = f.cargo\n"
    "LEFT JOIN FOTO AS ft ON ft.cpf_func = f.cpf\n"
    "LEFT JOIN EMAIL AS em ON em.cpf_func = f.cpf"
)


class FuncionarioRepository:

    def __init__(self, db_manager: DatabaseManager) -> None:
        self._db_manager = db_manager


    def list_funcionarios(self) -> Sequence[dict[str, Any]]:
        sql = f"{_FUNCIONARIO_BASE_QUERY}\nORDER BY f.nome"
        return self._db_manager.execute_raw_query(sql)


    def get_funcionario_by_cpf(self, cpf: str) -> Optional[dict[str, Any]]:
        sql = f"{_FUNCIONARIO_BASE_QUERY}\nWHERE f.cpf = :cpf"
        result = self._db_manager.execute_raw_query(sql, {"cpf": cpf})
        return result[0] if result else None


    def get_funcionario_by_email(self, email: str) -> Optional[dict[str, Any]]:
        sql = f"{_FUNCIONARIO_BASE_QUERY}\nWHERE em.email = :email"
        result = self._db_manager.execute_raw_query(sql, {"email": email})
        return result[0] if result else None


    def get_auth_record(self, email: str) -> Optional[dict[str, Any]]:
        sql = (
            "SELECT "
            "\tf.cpf, "
            "\tf.nome, "
            "\tf.senha, "
            "\tf.orgao_pub, "
            "\tf.cargo "
            "FROM FUNCIONARIO AS f "
            "JOIN EMAIL AS em ON em.cpf_func = f.cpf "
            "WHERE em.email = :email"
        )
        result = self._db_manager.execute_raw_query(sql, {"email": email})
        return result[0] if result else None


    def create_funcionario(
        self,
        payload: Dict[str, Any],
        *,
        email: Optional[str],
        foto: Optional[bytes],
    ) -> None:
        insert_sql = (
            "INSERT INTO FUNCIONARIO (cpf, nome, orgao_pub, cargo, data_nasc, inicio_contrato, fim_contrato, senha) "
            "VALUES (:cpf, :nome, :orgao_pub, :cargo, :data_nasc, :inicio_contrato, :fim_contrato, :senha)"
        )

        with self._db_manager.engine.begin() as connection:
            connection.execute(text(insert_sql), payload)
            cpf = payload["cpf"]

            if email:
                connection.execute(
                    text("INSERT INTO EMAIL (cpf_func, email) VALUES (:cpf, :email)"),
                    {"cpf": cpf, "email": email},
                )

            if foto is not None:
                connection.execute(
                    text("INSERT INTO FOTO (cpf_func, imagem) VALUES (:cpf, :foto)"),
                    {"cpf": cpf, "foto": foto},
                )


    def update_funcionario(
        self,
        cpf: str,
        fields_to_update: Dict[str, Any],
        *,
        email: Optional[str],
        update_email: bool,
        foto: Optional[bytes],
        update_foto: bool,
    ) -> None:
        with self._db_manager.engine.begin() as connection:
            if fields_to_update:
                set_clause = ", ".join(f"{column} = :{column}" for column in fields_to_update.keys())
                params = {**fields_to_update, "cpf": cpf}
                connection.execute(
                    text(f"UPDATE FUNCIONARIO SET {set_clause} WHERE cpf = :cpf"),
                    params,
                )

            if update_email:
                self._sync_email(connection, cpf, email)

            if update_foto:
                self._sync_foto(connection, cpf, foto)


    def delete_funcionario(self, cpf: str) -> None:
        with self._db_manager.engine.begin() as connection:
            connection.execute(
                text("DELETE FROM FUNCIONARIO WHERE cpf = :cpf"),
                {"cpf": cpf},
            )


    def _sync_email(self, connection: Connection, cpf: str, email: Optional[str]) -> None:
        connection.execute(
            text("DELETE FROM EMAIL WHERE cpf_func = :cpf"),
            {"cpf": cpf},
        )

        if email:
            connection.execute(
                text("INSERT INTO EMAIL (cpf_func, email) VALUES (:cpf, :email)"),
                {"cpf": cpf, "email": email},
            )


    def _sync_foto(self, connection: Connection, cpf: str, foto: Optional[bytes]) -> None:
        connection.execute(
            text("DELETE FROM FOTO WHERE cpf_func = :cpf"),
            {"cpf": cpf},
        )

        if foto is not None:
            connection.execute(
                text("INSERT INTO FOTO (cpf_func, imagem) VALUES (:cpf, :foto)"),
                {"cpf": cpf, "foto": foto},
            )

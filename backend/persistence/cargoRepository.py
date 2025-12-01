from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text

from .databaseManager import DatabaseManager

_CARGO_BASE_QUERY = (
    "SELECT "
    "\tcargo.cod_cargo, "
    "\tcargo.nome, "
    "\tcargo.descricao "
    "FROM CARGO AS cargo"
)


class CargoRepository:

    def __init__(self, db_manager: DatabaseManager) -> None:
        self._db_manager = db_manager


    def list_cargos(self) -> Sequence[dict[str, Any]]:
        sql = f"{_CARGO_BASE_QUERY}\nORDER BY cargo.nome"
        return self._db_manager.execute_raw_query(sql)


    def get_cargo_by_id(self, cod_cargo: int) -> Optional[dict[str, Any]]:
        sql = f"{_CARGO_BASE_QUERY}\nWHERE cargo.cod_cargo = :cod_cargo"
        result = self._db_manager.execute_raw_query(sql, {"cod_cargo": cod_cargo})
        return result[0] if result else None


    def create_cargo(self, *, nome: str, descricao: Optional[str]) -> int:
        insert_sql = "INSERT INTO CARGO (nome, descricao) VALUES (:nome, :descricao)"

        with self._db_manager.engine.begin() as connection:
            result = connection.execute(
                text(insert_sql),
                {"nome": nome, "descricao": descricao},
            )
            cod_cargo = result.lastrowid
            if not cod_cargo:
                cod_cargo_result = connection.execute(text("SELECT LAST_INSERT_ID()"))
                cod_cargo = cod_cargo_result.scalar_one()

        return int(cod_cargo)


    def update_cargo(self, cod_cargo: int, fields_to_update: Dict[str, Any]) -> None:
        if not fields_to_update:
            return

        with self._db_manager.engine.begin() as connection:
            set_clause = ", ".join(f"{column} = :{column}" for column in fields_to_update)
            params = {**fields_to_update, "cod_cargo": cod_cargo}
            connection.execute(
                text(f"UPDATE CARGO SET {set_clause} WHERE cod_cargo = :cod_cargo"),
                params,
            )


    def delete_cargo(self, cod_cargo: int) -> None:
        with self._db_manager.engine.begin() as connection:
            connection.execute(
                text("DELETE FROM CARGO WHERE cod_cargo = :cod_cargo"),
                {"cod_cargo": cod_cargo},
            )

import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy.exc import SQLAlchemyError

from ..persistence.cargoRepository import CargoRepository
from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()

class CargoService:
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._repository = CargoRepository(db_manager)


    def list_cargos(self) -> Sequence[dict[str, Any]]:
        return self._repository.list_cargos()


    def get_cargo_by_id(self, cod_cargo: int) -> Optional[dict[str, Any]]:
        return self._repository.get_cargo_by_id(cod_cargo)


    def create_cargo(self, *, nome: str, descricao: Optional[str]) -> dict[str, Any]:
        try:
            cod_cargo = self._repository.create_cargo(nome=nome, descricao=descricao)
        except SQLAlchemyError:
            logger.exception("Erro ao criar cargo")
            raise

        created = self.get_cargo_by_id(int(cod_cargo))
        if created is None:
            raise RuntimeError("Cargo recem criado nao encontrado")
        return created


    def update_cargo(
        self,
        cod_cargo: int,
        *,
        nome: Any = _UNSET,
        descricao: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if descricao is not _UNSET:
            fields_to_update["descricao"] = descricao

        if fields_to_update:
            try:
                self._repository.update_cargo(cod_cargo, fields_to_update)
            except SQLAlchemyError:
                logger.exception("Erro ao atualizar cargo %s", cod_cargo)
                raise

        return self.get_cargo_by_id(cod_cargo)


    def delete_cargo(self, cod_cargo: int) -> None:
        try:
            self._repository.delete_cargo(cod_cargo)
        except SQLAlchemyError:
            logger.exception("Erro ao deletar cargo %s", cod_cargo)
            raise

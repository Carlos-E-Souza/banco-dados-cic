import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager
from ..persistence.orgaoPublicoRepository import OrgaoPublicoRepository

logger = logging.getLogger(__name__)

_UNSET = object()

class OrgaoPublicoService:
    
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._repository = OrgaoPublicoRepository(db_manager)


    def list_orgaos_publicos(self) -> Sequence[dict[str, Any]]:
        return self._repository.list_orgaos_publicos()


    def get_orgao_by_id(self, cod_orgao: int) -> Optional[dict[str, Any]]:
        return self._repository.get_orgao_by_id(cod_orgao)


    def create_orgao_publico(
        self,
        *,
        nome: str,
        estado: str,
        data_ini: str,
        descr: Optional[str],
        data_fim: Optional[str],
    ) -> dict[str, Any]:
        try:
            cod_orgao = self._repository.create_orgao_publico(
                nome=nome,
                estado=estado,
                descr=descr,
                data_ini=data_ini,
                data_fim=data_fim,
            )
        except SQLAlchemyError:
            logger.exception("Erro ao criar orgao publico")
            raise

        created = self.get_orgao_by_id(int(cod_orgao))
        if created is None:
            raise RuntimeError("Orgao publico recem criado nao encontrado")
        return created


    def update_orgao_publico(
        self,
        cod_orgao: int,
        *,
        nome: Any = _UNSET,
        estado: Any = _UNSET,
        descr: Any = _UNSET,
        data_ini: Any = _UNSET,
        data_fim: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if estado is not _UNSET:
            fields_to_update["estado"] = estado
        if descr is not _UNSET:
            fields_to_update["descr"] = descr
        if data_ini is not _UNSET:
            fields_to_update["data_ini"] = data_ini
        if data_fim is not _UNSET:
            fields_to_update["data_fim"] = data_fim

        if fields_to_update:
            try:
                self._repository.update_orgao_publico(cod_orgao, fields_to_update)
            except SQLAlchemyError:
                logger.exception("Erro ao atualizar orgao publico %s", cod_orgao)
                raise

        return self.get_orgao_by_id(cod_orgao)


    def delete_orgao_publico(self, cod_orgao: int) -> None:
        try:
            self._repository.delete_orgao_publico(cod_orgao)
        except SQLAlchemyError:
            logger.exception("Erro ao deletar orgao publico %s", cod_orgao)
            raise

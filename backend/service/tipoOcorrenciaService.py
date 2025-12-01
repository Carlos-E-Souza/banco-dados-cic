import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager
from ..persistence.tipoOcorrenciaRepository import TipoOcorrenciaRepository

logger = logging.getLogger(__name__)

_UNSET = object()

class TipoOcorrenciaService:
    
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._repository = TipoOcorrenciaRepository(db_manager)


    def list_tipos_ocorrencia(self) -> Sequence[dict[str, Any]]:
        return self._repository.list_tipos_ocorrencia()


    def get_tipo_by_id(self, cod_tipo: int) -> Optional[dict[str, Any]]:
        return self._repository.get_tipo_by_id(cod_tipo)


    def create_tipo_ocorrencia(
        self,
        *,
        nome: str,
        descr: Optional[str],
        orgao_pub: int,
    ) -> dict[str, Any]:
        try:
            cod_tipo = self._repository.create_tipo_ocorrencia(
                nome=nome,
                descr=descr,
                orgao_pub=orgao_pub,
            )
        except SQLAlchemyError:
            logger.exception("Erro ao criar tipo de ocorrencia")
            raise

        created = self.get_tipo_by_id(int(cod_tipo))
        if created is None:
            raise RuntimeError("Tipo de ocorrencia recem criado nao encontrado")
        return created


    def update_tipo_ocorrencia(
        self,
        cod_tipo: int,
        *,
        nome: Any = _UNSET,
        descr: Any = _UNSET,
        orgao_pub: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if descr is not _UNSET:
            fields_to_update["descr"] = descr
        if orgao_pub is not _UNSET:
            fields_to_update["orgao_pub"] = orgao_pub

        if fields_to_update:
            try:
                self._repository.update_tipo_ocorrencia(cod_tipo, fields_to_update)
            except SQLAlchemyError:
                logger.exception("Erro ao atualizar tipo de ocorrencia %s", cod_tipo)
                raise

        return self.get_tipo_by_id(cod_tipo)


    def delete_tipo_ocorrencia(self, cod_tipo: int) -> None:
        try:
            self._repository.delete_tipo_ocorrencia(cod_tipo)
        except SQLAlchemyError:
            logger.exception("Erro ao deletar tipo de ocorrencia %s", cod_tipo)
            raise

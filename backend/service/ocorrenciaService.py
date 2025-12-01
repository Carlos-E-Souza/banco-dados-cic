import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager
from ..persistence.ocorrenciaRepository import OcorrenciaRepository

logger = logging.getLogger(__name__)

_UNSET = object()

class OcorrenciaService:
    
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._repository = OcorrenciaRepository(db_manager)


    def list_ocorrencias(self) -> Sequence[dict[str, Any]]:
        return self._repository.list_ocorrencias()


    def list_ocorrencias_by_morador(self, cpf: str) -> Sequence[dict[str, Any]]:
        return self._repository.list_ocorrencias_by_morador(cpf)


    def get_ocorrencia_by_id(self, cod_oco: int) -> Optional[dict[str, Any]]:
        return self._repository.get_ocorrencia_by_id(cod_oco)


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
            cod_oco = self._repository.create_ocorrencia(
                cod_tipo=cod_tipo,
                cpf_morador=cpf_morador,
                cod_local=cod_local,
                endereco=endereco,
                data=data,
                tipo_status=tipo_status,
                descr=descr,
                localidade=localidade,
            )
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

        try:
            self._repository.update_ocorrencia(
                cod_oco,
                fields_to_update=fields_to_update,
                cod_local=cod_local if cod_local is not _UNSET else None,
                update_cod_local=cod_local is not _UNSET,
                localidade=localidade if localidade is not _UNSET else None,
                update_localidade=localidade is not _UNSET,
            )
        except SQLAlchemyError:
            logger.exception("Erro ao atualizar ocorrencia %s", cod_oco)
            raise

        return self.get_ocorrencia_by_id(cod_oco)


    def delete_ocorrencia(self, cod_oco: int) -> None:
        try:
            self._repository.delete_ocorrencia(cod_oco)
        except SQLAlchemyError:
            logger.exception("Erro ao deletar ocorrencia %s", cod_oco)
            raise

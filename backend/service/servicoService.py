import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager
from ..persistence.servicoRepository import ServicoRepository

logger = logging.getLogger(__name__)

_UNSET = object()

class ServicoService:
    
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._repository = ServicoRepository(db_manager)


    def list_servicos(self) -> Sequence[dict[str, Any]]:
        return self._repository.list_servicos()


    def get_servico_by_id(self, cod_servico: int) -> Optional[dict[str, Any]]:
        return self._repository.get_servico_by_id(cod_servico)


    def get_servicos_by_ocorrencia(self, cod_ocorrencia: int) -> Sequence[dict[str, Any]]:
        return self._repository.get_servicos_by_ocorrencia(cod_ocorrencia)


    def create_servico(
        self,
        *,
        cod_orgao: int,
        cod_ocorrencia: int,
        nome: str,
        descr: Optional[str],
        inicio_servico: Optional[str],
        fim_servico: Optional[str],
    ) -> dict[str, Any]:
        try:
            cod_servico = self._repository.create_servico(
                cod_orgao=cod_orgao,
                cod_ocorrencia=cod_ocorrencia,
                nome=nome,
                descr=descr,
                inicio_servico=inicio_servico,
                fim_servico=fim_servico,
            )
        except SQLAlchemyError:
            logger.exception("Erro ao criar servico")
            raise
        created = self.get_servico_by_id(int(cod_servico))
        if created is None:
            raise RuntimeError("Servico recem criado nao encontrado")
        return created


    def update_servico(
        self,
        cod_servico: int,
        *,
        cod_orgao: Any = _UNSET,
        cod_ocorrencia: Any = _UNSET,
        nome: Any = _UNSET,
        descr: Any = _UNSET,
        inicio_servico: Any = _UNSET,
        fim_servico: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if cod_orgao is not _UNSET:
            fields_to_update["cod_orgao"] = cod_orgao
        if cod_ocorrencia is not _UNSET:
            fields_to_update["cod_ocorrencia"] = cod_ocorrencia
        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if descr is not _UNSET:
            fields_to_update["descr"] = descr
        if inicio_servico is not _UNSET:
            fields_to_update["inicio_servico"] = inicio_servico
        if fim_servico is not _UNSET:
            fields_to_update["fim_servico"] = fim_servico

        if fields_to_update:
            try:
                self._repository.update_servico(cod_servico, fields_to_update)
            except SQLAlchemyError:
                logger.exception("Erro ao atualizar servico %s", cod_servico)
                raise

        return self.get_servico_by_id(cod_servico)


    def delete_servico(self, cod_servico: int) -> None:
        try:
            self._repository.delete_servico(cod_servico)
        except SQLAlchemyError:
            logger.exception("Erro ao deletar servico %s", cod_servico)
            raise

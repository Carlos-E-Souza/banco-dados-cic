import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy.exc import SQLAlchemyError

from ..persistence.avaliacaoRepository import AvaliacaoRepository
from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()


class AvaliacaoService:

    def __init__(self, db_manager: DatabaseManager) -> None:
        self._repository = AvaliacaoRepository(db_manager)


    def list_avaliacoes(self) -> Sequence[dict[str, Any]]:
        return self._repository.list_avaliacoes()


    def get_avaliacao_by_id(self, cod_aval: int) -> Optional[dict[str, Any]]:
        return self._repository.get_avaliacao_by_id(cod_aval)


    def get_avaliacao_by_ocorrencia(self, cod_ocorrencia: int) -> Optional[dict[str, Any]]:
        return self._repository.get_avaliacao_by_ocorrencia(cod_ocorrencia)


    def create_avaliacao(
        self,
        *,
        cod_ocorrencia: int,
        cod_servico: int,
        cpf_morador: str,
        nota_serv: int,
        nota_tempo: int,
        opiniao: Optional[str],
    ) -> dict[str, Any]:
        try:
            cod_aval = self._repository.create_avaliacao(
                cod_ocorrencia=cod_ocorrencia,
                cod_servico=cod_servico,
                cpf_morador=cpf_morador,
                nota_serv=nota_serv,
                nota_tempo=nota_tempo,
                opiniao=opiniao,
            )
        except SQLAlchemyError:
            logger.exception("Erro ao registrar avaliacao")
            raise

        created = self.get_avaliacao_by_id(cod_aval)
        if created is None:
            raise RuntimeError("Avaliacao recem criada nao encontrada")
        return created


    def update_avaliacao(
        self,
        cod_aval: int,
        *,
        cod_ocorrencia: Any = _UNSET,
        cod_servico: Any = _UNSET,
        cpf_morador: Any = _UNSET,
        nota_serv: Any = _UNSET,
        nota_tempo: Any = _UNSET,
        opiniao: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:
        fields_to_update: Dict[str, Any] = {}
        if cod_ocorrencia is not _UNSET:
            fields_to_update["cod_ocorrencia"] = cod_ocorrencia
        if cod_servico is not _UNSET:
            fields_to_update["cod_servico"] = cod_servico
        if cpf_morador is not _UNSET:
            fields_to_update["cpf_morador"] = cpf_morador
        if nota_serv is not _UNSET:
            fields_to_update["nota_serv"] = nota_serv
        if nota_tempo is not _UNSET:
            fields_to_update["nota_tempo"] = nota_tempo
        if opiniao is not _UNSET:
            fields_to_update["opiniao"] = opiniao

        if fields_to_update:
            try:
                self._repository.update_avaliacao(cod_aval, fields_to_update)
            except SQLAlchemyError:
                logger.exception("Erro ao atualizar avaliacao %s", cod_aval)
                raise

        return self.get_avaliacao_by_id(cod_aval)


    def delete_avaliacao(self, cod_aval: int) -> None:
        try:
            self._repository.delete_avaliacao(cod_aval)
        except SQLAlchemyError:
            logger.exception("Erro ao deletar avaliacao %s", cod_aval)
            raise

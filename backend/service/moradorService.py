import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager
from ..persistence.moradorRepository import MoradorRepository

logger = logging.getLogger(__name__)

_UNSET = object()

class MoradorService:
    
    def __init__(self, db_manager: DatabaseManager) -> None:
        self._repository = MoradorRepository(db_manager)


    def list_moradores(self) -> Sequence[dict[str, Any]]:
        return self._repository.list_moradores()


    def get_morador_by_cpf(self, cpf: str) -> Optional[dict[str, Any]]:
        return self._repository.get_morador_by_cpf(cpf)


    def authenticate(self, email: str, senha: str) -> Optional[dict[str, Any]]:
        record = self._repository.get_auth_record(email)
        if not record:
            return None

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
            self._repository.create_morador(
                cpf=cpf,
                nome=nome,
                endereco=endereco,
                data_nasc=data_nasc,
                senha=senha,
                cod_local=cod_local,
                localidade=localidade,
                email=email,
                telefone=telefone,
                ddd=ddd,
            )
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
        fields_to_update: Dict[str, Any] = {}

        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if endereco is not _UNSET:
            fields_to_update["endereco"] = endereco
        if data_nasc is not _UNSET:
            fields_to_update["data_nasc"] = data_nasc
        if senha is not _UNSET:
            fields_to_update["senha"] = senha

        try:
            self._repository.update_morador(
                cpf,
                fields_to_update=fields_to_update,
                cod_local=cod_local if cod_local is not _UNSET else None,
                update_cod_local=cod_local is not _UNSET,
                localidade=localidade if localidade is not _UNSET else None,
                update_localidade=localidade is not _UNSET,
                email=email if email is not _UNSET else None,
                update_email=email is not _UNSET,
                telefone=telefone if telefone is not _UNSET else None,
                update_telefone=telefone is not _UNSET,
                ddd=ddd if ddd is not _UNSET else None,
                update_ddd=ddd is not _UNSET,
            )
        except SQLAlchemyError:
            logger.exception("Erro ao atualizar morador %s", cpf)
            raise

        return self.get_morador_by_cpf(cpf)


    def delete_morador(self, cpf: str) -> None:
        try:
            self._repository.delete_morador(cpf)
        except SQLAlchemyError:
            logger.exception("Erro ao deletar morador %s", cpf)
            raise

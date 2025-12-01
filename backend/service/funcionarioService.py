import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager
from ..persistence.funcionarioRepository import FuncionarioRepository


logger = logging.getLogger(__name__)

_UNSET = object()


class FuncionarioService:

    def __init__(self, db_manager: DatabaseManager) -> None:
        self._repository = FuncionarioRepository(db_manager)


    def list_funcionarios(self) -> Sequence[dict[str, Any]]:
        return self._repository.list_funcionarios()


    def get_funcionario_by_cpf(self, cpf: str) -> Optional[dict[str, Any]]:
        return self._repository.get_funcionario_by_cpf(cpf)


    def get_funcionario_by_email(self, email: str) -> Optional[dict[str, Any]]:
        return self._repository.get_funcionario_by_email(email)


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
            "orgao_pub": record["orgao_pub"],
            "cargo": record["cargo"],
        }


    def create_funcionario(
        self,
        cpf: str,
        nome: str,
        orgao_pub: int,
        cargo: int,
        data_nasc: str,
        inicio_contrato: str,
        senha: str,
        foto: Optional[bytes],
        email: Optional[str],
        fim_contrato: Optional[str] = None,
    ) -> dict[str, Any]:

        payload = {
            "cpf": cpf,
            "nome": nome,
            "orgao_pub": orgao_pub,
            "cargo": cargo,
            "data_nasc": data_nasc,
            "inicio_contrato": inicio_contrato,
            "fim_contrato": fim_contrato,
            "senha": senha,
        }

        try:
            self._repository.create_funcionario(payload, email=email, foto=foto)
        except SQLAlchemyError:
            logger.exception("Erro ao criar funcionario")
            raise

        created = self.get_funcionario_by_cpf(cpf)
        if created is None:
            raise RuntimeError("Funcionario recem criado nao encontrado")
        return created


    def update_funcionario(
        self,
        cpf: str,
        nome: Any = _UNSET,
        orgao_pub: Any = _UNSET,
        cargo: Any = _UNSET,
        data_nasc: Any = _UNSET,
        inicio_contrato: Any = _UNSET,
        fim_contrato: Any = _UNSET,
        senha: Any = _UNSET,
        email: Any = _UNSET,
        foto: Any = _UNSET,
    ) -> Optional[dict[str, Any]]:

        fields_to_update: Dict[str, Any] = {}
        if nome is not _UNSET:
            fields_to_update["nome"] = nome
        if orgao_pub is not _UNSET:
            fields_to_update["orgao_pub"] = orgao_pub
        if cargo is not _UNSET:
            fields_to_update["cargo"] = cargo
        if data_nasc is not _UNSET:
            fields_to_update["data_nasc"] = data_nasc
        if inicio_contrato is not _UNSET:
            fields_to_update["inicio_contrato"] = inicio_contrato
        if fim_contrato is not _UNSET:
            fields_to_update["fim_contrato"] = fim_contrato
        if senha is not _UNSET:
            fields_to_update["senha"] = senha

        email_update = email is not _UNSET
        foto_update = foto is not _UNSET

        try:
            self._repository.update_funcionario(
                cpf,
                fields_to_update,
                email=email if email_update else None,
                update_email=email_update,
                foto=foto if foto_update else None,
                update_foto=foto_update,
            )
        except SQLAlchemyError:
            logger.exception("Erro ao atualizar funcionario %s", cpf)
            raise

        return self.get_funcionario_by_cpf(cpf)


    def delete_funcionario(self, cpf: str) -> None:
        try:
            self._repository.delete_funcionario(cpf)
        except SQLAlchemyError:
            logger.exception("Erro ao deletar funcionario %s", cpf)
            raise

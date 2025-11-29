from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from src.db.db import CollectorDB, DatabaseManager, Filter, SingletonDB
from src.db.models import EmailDB, MoradorDB, TelefoneDB
from src.db.params import EqualTo
from src.schemas import Morador_Com_Contatos
from src.service.sanitize import valid_email_cpf_and_telefone

morador_router = APIRouter(prefix='/morador')

T_DbSession = Annotated[DatabaseManager, Depends(SingletonDB)]


@morador_router.get(
    '/get/{cpf}',
    response_model=Morador_Com_Contatos,
    status_code=HTTPStatus.OK,
)
def get_morador_by_cpf(cpf: str, session: T_DbSession):
    valid_email_cpf_and_telefone(cpf)
    collector = CollectorDB(session)

    erro_desconhecido = HTTPException(
        HTTPStatus.INTERNAL_SERVER_ERROR, 'erro desconhecido'
    )

    moradores_db = collector.collect_instances(
        Filter('morador', [EqualTo('cpf', cpf)])
    )

    if len(moradores_db) == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND, 'morador não encontrado')

    if not isinstance(moradores_db[0], MoradorDB):
        raise erro_desconhecido  # pragma: no cover

    morador_db = moradores_db[0]

    emails_db = collector.collect_instances(
        Filter('email', [EqualTo('cpf_morador', cpf)])
    )

    if len(emails_db) == 0:
        raise HTTPException(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            'cpf sem email, erro desconhecido',
        )  # pragma: no cover

    if not isinstance(emails_db[0], EmailDB):
        raise erro_desconhecido  # pragma: no cover

    telefones_db = collector.collect_instances(
        Filter('telefone', [EqualTo('cpf_morador', cpf)])
    )

    if len(telefones_db) == 0:
        telefones_db = []
    elif not isinstance(telefones_db[0], TelefoneDB):
        raise erro_desconhecido  # pragma: no cover

    return {
        'morador': morador_db,
        'contatos': {'emails': emails_db, 'telefones': telefones_db},
    }

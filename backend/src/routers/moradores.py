from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from src.db.db import CollectorDB, DatabaseManager, Filter, SingletonDB
from src.db.models import EmailDB, MoradorDB, TelefoneDB
from src.db.params import EqualTo
from src.schemas import (
    Contatos,
    Email,
    Morador_Com_Contatos,
    MoradorSchema,
    Telefone,
)
from src.service.sanitize import valid_email_cpf_and_telefone
from src.service.security import get_password_hash

morador_router = APIRouter(prefix='/morador')

T_DbSession = Annotated[DatabaseManager, Depends(SingletonDB)]


erro_desconhecido = HTTPException(
    HTTPStatus.INTERNAL_SERVER_ERROR, 'erro desconhecido'
)


def update_email(cpf: str, email: Email, session: DatabaseManager) -> None:
    collector = CollectorDB(session)
    email_in_use = collector.collect_instances(
        Filter('email', [EqualTo('email', email.email)])
    )
    if len(email_in_use) == 0:
        email_db = EmailDB(
            session,
            email.model_dump() | {'cpf_morador': cpf, 'cpf_func': None},
        )
    elif not isinstance(email_in_use[0], EmailDB):
        raise erro_desconhecido  # pragma: no cover
    elif email_in_use[0].cpf_morador == cpf:
        email_db = email_in_use[0]
    else:
        raise HTTPException(
            HTTPStatus.CONFLICT, f'O email: {email.email}, já está em uso'
        )
    email_db.update()


def update_telefone(
    cpf: str, telefone: Telefone, session: DatabaseManager
) -> None:
    collector = CollectorDB(session)
    telefone_in_use = collector.collect_instances(
        Filter('telefone', [EqualTo('telefone', telefone.telefone)])
    )
    if len(telefone_in_use) == 0:
        telefone.telefone = (
            '9' + telefone.telefone.replace(' ', '').replace('-', '')[-8:]
        )
        telefone_db = TelefoneDB(
            session,
            telefone.model_dump()
            | {'cpf_morador': cpf, 'cpf_funcionario': None},
        )
    elif not isinstance(telefone_in_use[0], TelefoneDB):
        raise erro_desconhecido  # pragma: no cover
    elif telefone_in_use[0].cpf_morador == cpf:
        telefone_db = telefone_in_use[0]
    else:
        raise HTTPException(
            HTTPStatus.CONFLICT,
            f'O telefone: {telefone.telefone}, já está em uso',
        )
    telefone_db.update()


def remove_old_email(
    cpf: str, emails: list[Email], session: DatabaseManager
) -> None:
    collector = CollectorDB(session)
    emails_db = collector.collect_instances(
        Filter('email', [EqualTo('cpf_morador', cpf)])
    )
    list_emails = [email.email for email in emails]
    for email_db in emails_db:
        if email_db.email not in list_emails:
            email_db.delete()


def remove_old_telefone(
    cpf: str, telefones: list[Telefone], session: DatabaseManager
) -> None:
    collector = CollectorDB(session)
    telefones_db = collector.collect_instances(
        Filter('telefone', [EqualTo('cpf_morador', cpf)])
    )
    list_telefones = [telefone.telefone for telefone in telefones]
    for telefone_db in telefones_db:
        if telefone_db.telefone not in list_telefones:
            telefone_db.delete()


@morador_router.get(
    '/{cpf}',
    response_model=Morador_Com_Contatos,
    status_code=HTTPStatus.OK,
)
def get_morador_by_cpf(cpf: str, session: T_DbSession):
    valid_email_cpf_and_telefone(cpf)
    collector = CollectorDB(session)

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


@morador_router.put('/', status_code=HTTPStatus.ACCEPTED)
def update_morador(
    morador: MoradorSchema, contatos: Contatos, session: T_DbSession
):
    valid_email_cpf_and_telefone(
        morador.cpf, contatos.emails, contatos.telefones
    )

    if contatos.emails == []:
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'emails vazios')

    collector = CollectorDB(session)

    moradores_db = collector.collect_instances(
        Filter('morador', [EqualTo('cpf', morador.cpf)])
    )
    if len(moradores_db) == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND, 'morador não encontrado')
    if not isinstance(moradores_db[0], MoradorDB):
        raise erro_desconhecido  # pragma: no cover

    morador_db = moradores_db[0]

    for attr, value in morador.model_dump().items():
        if attr == 'senha':
            setattr(morador_db, attr, get_password_hash(value))
        else:
            setattr(morador_db, attr, value)
    morador_db.update()

    for email in contatos.emails:
        update_email(morador.cpf, email, session)

    if not contatos.telefones:
        remove_old_email(morador.cpf, contatos.emails, session)
        session.commit()
        return

    for telefone in contatos.telefones:
        update_telefone(morador.cpf, telefone, session)

    remove_old_email(morador.cpf, contatos.emails, session)
    remove_old_telefone(morador.cpf, contatos.telefones, session)
    session.commit()

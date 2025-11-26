from http import HTTPStatus
from typing import Annotated

from email_validator import EmailNotValidError, validate_email
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from validate_docbr import CPF

from src.db.db import CollectorDB, DatabaseManager, Filter, SingletonDB
from src.db.models import EmailDB, FuncionarioDB, MoradorDB
from src.db.params import EqualTo
from src.schemas import (
    Email,
    FuncionarioSchema,
    MoradorSchema,
)
from src.service.security import get_password_hash

auth_router = APIRouter(prefix='/auth')

T_AuthRequestForm = Annotated[OAuth2PasswordRequestForm, Depends()]
T_DbSession = Annotated[DatabaseManager, Depends(SingletonDB)]


def valid_email_end_cpf(cpf: str, email: str) -> None:
    if not CPF().validate(cpf):
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'invalid cpf')

    try:
        validate_email(email)
    except EmailNotValidError:
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'invalid email')


def find_conflict(
    session: DatabaseManager,
    obj: MoradorSchema | FuncionarioSchema,
    email: Email,
) -> None:

    if isinstance(obj, MoradorSchema):
        table = 'morador'
    else:
        table = 'funcionario'

    collector = CollectorDB(session)
    cpf_in_use = collector.collect_instances(
        Filter(table, [EqualTo('cpf', obj.cpf)])
    )
    if len(cpf_in_use) > 0:
        raise HTTPException(HTTPStatus.CONFLICT, 'cpf, allready exist in db')

    email_in_use = collector.collect_instances(
        Filter('email', [EqualTo('email', email.email)])
    )
    if len(email_in_use) > 0:
        raise HTTPException(HTTPStatus.CONFLICT, 'email, allready in use')


@auth_router.post('/morador', status_code=HTTPStatus.CREATED)
def create_morador(morador: MoradorSchema, email: Email, session: T_DbSession):

    valid_email_end_cpf(morador.cpf, email.email)

    find_conflict(session, morador, email)

    data = morador.model_dump()
    data['senha'] = get_password_hash(data['senha'])

    morador_db = MoradorDB(session, data)

    morador_db.update()

    data = email.model_dump()
    data.update({'cpf_morador': morador.cpf, 'cpf_func': None})

    email_db = EmailDB(session, data)

    email_db.update()

    session.commit()


@auth_router.post('/funcionario', status_code=HTTPStatus.CREATED)
def create_funcionario(
    funcionario: FuncionarioSchema, email: Email, session: T_DbSession
):

    valid_email_end_cpf(funcionario.cpf, email.email)

    find_conflict(session, funcionario, email)

    data = funcionario.model_dump()
    data['senha'] = get_password_hash(data['senha'])

    funcionario_db = FuncionarioDB(session, data)

    funcionario_db.update()

    data = email.model_dump()
    data.update({'cpf_morador': None, 'cpf_func': funcionario.cpf})

    email_db = EmailDB(session, data)

    email_db.update()

    session.commit()

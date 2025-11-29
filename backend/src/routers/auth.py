from http import HTTPStatus
from typing import Annotated, Sequence

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from src.db.db import CollectorDB, DatabaseManager, Filter, SingletonDB
from src.db.models import EmailDB, FuncionarioDB, MoradorDB, TelefoneDB
from src.db.params import EqualTo
from src.interfaces.interfaces import ObjectDBInterface
from src.schemas import (
    Contatos,
    Email,
    FuncionarioSchema,
    LoginResult,
    MoradorSchema,
    Telefone,
)
from src.service.sanitize import find_conflict, valid_email_cpf_and_telefone
from src.service.security import get_password_hash, verify_password_hash

auth_router = APIRouter(prefix='/auth')

T_AuthRequestForm = Annotated[OAuth2PasswordRequestForm, Depends()]
T_DbSession = Annotated[DatabaseManager, Depends(SingletonDB)]


def create_user(
    session: DatabaseManager,
    obj: MoradorSchema | FuncionarioSchema,
    emails: list[Email],
    telefones: list[Telefone] | None = None,
):
    valid_email_cpf_and_telefone(obj.cpf, emails, telefones)

    find_conflict(session, obj, emails, telefones)

    data = obj.model_dump()
    data['senha'] = get_password_hash(data['senha'])
    if isinstance(obj, FuncionarioSchema):
        obj_db = FuncionarioDB(session, data)
    else:
        obj_db = MoradorDB(session, data)
    obj_db.update()

    for email in emails:
        data = email.model_dump()
        if isinstance(obj, FuncionarioSchema):
            data.update({'cpf_morador': None, 'cpf_func': obj.cpf})
        else:
            data.update({'cpf_morador': obj.cpf, 'cpf_func': None})
        email_db = EmailDB(session, data)
        email_db.update()

    if not telefones or isinstance(obj, FuncionarioSchema):
        session.commit()
        return

    for telefone in telefones:
        telefone.telefone = (
            '9' + telefone.telefone.replace(' ', '').replace('-', '')[-8:]
        )
        data = telefone.model_dump()
        data.update({'cpf_morador': obj.cpf})
        telefone_db = TelefoneDB(session, data)
        telefone_db.update()

    session.commit()


@auth_router.post('/morador/', status_code=HTTPStatus.CREATED)
def create_morador_or_funcionario(
    morador: MoradorSchema | FuncionarioSchema,
    contatos: Contatos,
    session: T_DbSession,
):
    create_user(session, morador, contatos.emails, contatos.telefones)


@auth_router.post('/funcionario/', status_code=HTTPStatus.CREATED)
def create_funcionario(
    funcionario: FuncionarioSchema, contatos: Contatos, session: T_DbSession
):
    create_user(session, funcionario, contatos.emails)


@auth_router.post(
    '/login/', response_model=LoginResult, status_code=HTTPStatus.OK
)
def login(form_data: T_AuthRequestForm, session: T_DbSession):
    collector = CollectorDB(session)
    result: Sequence[ObjectDBInterface] = collector.collect_instances(
        Filter('email', [EqualTo('email', form_data.username)])
    )

    if len(result) == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND, 'email not found')
    if not isinstance(result[0], EmailDB):
        raise HTTPException(
            HTTPStatus.INTERNAL_SERVER_ERROR, 'erro desconhecido'
        )  # pragma: no cover
    email_db: EmailDB = result[0]

    if email_db.cpf_func:
        obj: ObjectDBInterface = collector.collect_instances(
            Filter('funcionario', [EqualTo('cpf', email_db.cpf_func)])
        )[0]
    else:
        obj: ObjectDBInterface = collector.collect_instances(
            Filter('morador', [EqualTo('cpf', email_db.cpf_morador)])
        )[0]

    if not (isinstance(obj, FuncionarioDB) or isinstance(obj, MoradorDB)):
        raise HTTPException(
            HTTPStatus.INTERNAL_SERVER_ERROR, 'erro desconhecido'
        )  # pragma: no cover

    if not verify_password_hash(form_data.password, obj.senha):
        raise HTTPException(
            HTTPStatus.FORBIDDEN, 'incorrect email or password'
        )

    return {'funcionario': isinstance(obj, FuncionarioDB), 'data': obj}

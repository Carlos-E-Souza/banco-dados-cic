from http import HTTPStatus

from email_validator import EmailNotValidError, validate_email
from fastapi import HTTPException
from validate_docbr import CPF

from src.db.db import CollectorDB, DatabaseManager, Filter
from src.db.params import EqualTo
from src.schemas import Email, FuncionarioSchema, MoradorSchema, Telefone


def valid_telefone(telefone: Telefone) -> None:

    ddd_len = 2
    telefone_len = 8
    if len(telefone.ddd) != ddd_len or not telefone.ddd.isdigit():
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, f'invalid telefone.ddd: {telefone.ddd}'
        )

    temp = telefone.telefone.replace(' ', '').replace('-', '')[-8:]

    if not temp.isdigit() or len(temp) != telefone_len:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            f'invalid telefone.telefone: {telefone.telefone}',
        )


def valid_telefones(telefones: list[Telefone]) -> None:
    for telefone in telefones:
        valid_telefone(telefone)


def valid_emails(emails: list[Email]) -> None:
    for email in emails:
        try:
            email_str = str(email.email)
            validate_email(email_str)
        except EmailNotValidError:
            raise HTTPException(
                HTTPStatus.BAD_REQUEST, f'invalid email: {email.email}'
            )


def valid_email_cpf_and_telefone(
    cpf: str | None = None,
    emails: list[Email] | None = None,
    telefones: list[Telefone] | None = None,
) -> None:
    if cpf and not CPF().validate(cpf):
        raise HTTPException(HTTPStatus.BAD_REQUEST, f'invalid cpf: {cpf}')

    if emails:
        valid_emails(emails)

    if telefones:
        valid_telefones(telefones)


def find_conflict(
    session: DatabaseManager,
    obj: MoradorSchema | FuncionarioSchema,
    emails: list[Email],
    telefones: list[Telefone] | None = None,
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

    for email in emails:
        email_in_use = collector.collect_instances(
            Filter('email', [EqualTo('email', email.email)])
        )
        if len(email_in_use) > 0:
            raise HTTPException(HTTPStatus.CONFLICT, 'email, allready in use')

    if not telefones:
        return

    for telefone in telefones:
        telefone_in_use = collector.collect_instances(
            Filter('telefone', [EqualTo('telefone', telefone.telefone)])
        )

        if len(telefone_in_use) > 0:
            raise HTTPException(
                HTTPStatus.CONFLICT, 'telefone, allready in use'
            )

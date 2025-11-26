from datetime import datetime
from http import HTTPStatus

from fastapi.testclient import TestClient

from src.db.db import DatabaseManager


def test_auth_morador_post(
    client, db: DatabaseManager, data_on_db, cpfs, emails
):
    rsp = client.post(
        '/auth/morador',
        json={
            'morador': {
                'cpf': cpfs[2],
                'nome': 'nome test',
                'cod_local': 1,
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'senha': 'secret test',
            },
            'email': {'email': emails[2]},
        },
    )

    assert rsp.status_code == HTTPStatus.CREATED

    result = db.read_raw_query(f'SELECT * FROM MORADOR WHERE cpf = {cpfs[2]}')
    assert len(result) == 1

    result = result[0]

    assert result['cpf'] == cpfs[2]

    result = db.read_raw_query(
        f'SELECT * FROM EMAIL WHERE email = "{emails[2]}"'
    )

    assert len(result) == 1

    result = result[0]

    assert result['cpf_morador'] == cpfs[2]


def test_auth_funcionario_post(
    client, db: DatabaseManager, data_on_db, cpfs, emails
):
    rsp = client.post(
        '/auth/funcionario',
        json={
            'funcionario': {
                'cpf': cpfs[2],
                'orgao_pub': 1,
                'cargo': 1,
                'nome': 'nome test',
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'inicio_contrato': datetime(2000, 1, 1).isoformat(),
                'fim_contrato': None,
                'senha': 'secret test',
            },
            'email': {'email': emails[2]},
        },
    )

    assert rsp.status_code == HTTPStatus.CREATED

    result = db.read_raw_query(
        f'SELECT * FROM FUNCIONARIO WHERE cpf = {cpfs[2]}'
    )
    assert len(result) == 1

    result = result[0]

    assert result['cpf'] == cpfs[2]

    result = db.read_raw_query(
        f'SELECT * FROM EMAIL WHERE email = "{emails[2]}"'
    )

    assert len(result) == 1

    result = result[0]

    assert result['cpf_func'] == cpfs[2]


def test_auth_find_conflict_cpf(
    client, db: DatabaseManager, data_on_db, cpfs, emails
):
    rsp = client.post(
        '/auth/morador',
        json={
            'morador': {
                'cpf': cpfs[0],
                'nome': 'nome test',
                'cod_local': 1,
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'senha': 'secret test',
            },
            'email': {'email': emails[2]},
        },
    )

    assert rsp.status_code == HTTPStatus.CONFLICT
    assert rsp.json()['detail'] == 'cpf, allready exist in db'


def test_auth_find_conflict_email(
    client, db: DatabaseManager, data_on_db, cpfs, emails
):
    rsp = client.post(
        '/auth/funcionario',
        json={
            'funcionario': {
                'cpf': cpfs[2],
                'orgao_pub': 1,
                'cargo': 1,
                'nome': 'nome test',
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'inicio_contrato': datetime(2000, 1, 1).isoformat(),
                'fim_contrato': None,
                'senha': 'secret test',
            },
            'email': {'email': emails[1]},
        },
    )

    assert rsp.status_code == HTTPStatus.CONFLICT
    assert rsp.json()['detail'] == 'email, allready in use'


def test_valid_email_and_cpf_with_invalid_email(client: TestClient, cpfs):
    rsp = client.post(
        '/auth/morador',
        json={
            'morador': {
                'cpf': cpfs[2],
                'nome': 'nome test',
                'cod_local': 1,
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'senha': 'secret test',
            },
            'email': {'email': 'invalid_email@bolinha.net'},
        },
    )

    assert rsp.status_code == HTTPStatus.BAD_REQUEST
    assert rsp.json()['detail'] == 'invalid email'


def test_valid_email_and_cpf_with_invalid_cpf(client: TestClient, emails):
    rsp = client.post(
        '/auth/morador',
        json={
            'morador': {
                'cpf': '123.675',
                'nome': 'nome test',
                'cod_local': 1,
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'senha': 'secret test',
            },
            'email': {'email': emails[2]},
        },
    )

    assert rsp.status_code == HTTPStatus.BAD_REQUEST
    assert rsp.json()['detail'] == 'invalid cpf'

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


def test_auth_login_post_with_morador(
    client: TestClient, db: DatabaseManager, data_on_db
):
    rsp = client.post(
        'auth/login',
        data={
            'username': data_on_db['email_morador']['email'],
            'password': data_on_db['morador']['senha_sem_hash'],
        },
    )

    assert rsp.status_code == HTTPStatus.OK

    data = rsp.json()

    assert data['funcionario'] is False
    assert data['data']['cpf'] == data_on_db['morador']['cpf']


def test_auth_login_post_with_funcionario(
    client: TestClient, db: DatabaseManager, data_on_db
):
    rsp = client.post(
        'auth/login',
        data={
            'username': data_on_db['email_func']['email'],
            'password': data_on_db['funcionario']['senha_sem_hash'],
        },
    )

    assert rsp.status_code == HTTPStatus.OK

    data = rsp.json()

    assert data['funcionario'] is True
    assert data['data']['cpf'] == data_on_db['funcionario']['cpf']


def test_auth_login_with_email_not_found(
    client: TestClient, db: DatabaseManager, data_on_db, emails
):
    rsp = client.post(
        'auth/login',
        data={
            'username': emails[2],
            'password': data_on_db['funcionario']['senha_sem_hash'],
        },
    )

    assert rsp.status_code == HTTPStatus.NOT_FOUND
    assert rsp.json()['detail'] == 'email not found'


def test_auth_login_with_wrong_password(
    client: TestClient, db: DatabaseManager, data_on_db
):
    rsp = client.post(
        'auth/login',
        data={
            'username': data_on_db['email_morador']['email'],
            'password': 'wrong password',
        },
    )

    assert rsp.status_code == HTTPStatus.FORBIDDEN
    assert rsp.json()['detail'] == 'incorrect email or password'

from datetime import datetime
from http import HTTPStatus

from fastapi.testclient import TestClient

from src.db.db import DatabaseManager


def test_auth_morador_post(client, db: DatabaseManager, data_on_db):
    rsp = client.post(
        '/auth/morador',
        json={
            'morador': {
                'cpf': data_on_db['cpfs'][2],
                'nome': 'nome test',
                'cod_local': 1,
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'senha': 'secret test',
            },
            'contatos': {
                'emails': [
                    {'email': data_on_db['emails'][2]},
                    {'email': data_on_db['emails'][3]},
                ],
                'telefones': [
                    {'telefone': data_on_db['telefones'][2], 'ddd': '61'},
                    {'telefone': data_on_db['telefones'][3], 'ddd': '61'},
                ],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.CREATED

    result = db.read_raw_query(
        'SELECT * FROM MORADOR WHERE cpf = :cpf',
        {'cpf': data_on_db['cpfs'][2]},
    )
    assert len(result) == 1

    result = result[0]

    assert result['cpf'] == data_on_db['cpfs'][2]

    result = db.read_raw_query(
        'SELECT * FROM EMAIL WHERE email = :email',
        {'email': data_on_db['emails'][2]},
    )

    assert len(result) == 1

    result = result[0]

    assert result['cpf_morador'] == data_on_db['cpfs'][2]

    result = db.read_raw_query(
        'SELECT * FROM TELEFONE WHERE telefone = :telefone',
        {'telefone': '9' + data_on_db['telefones'][2]},
    )

    assert len(result) == 1

    result = result[0]

    assert result['cpf_morador'] == data_on_db['cpfs'][2]


def test_auth_funcionario_post(client, db: DatabaseManager, data_on_db):
    rsp = client.post(
        '/auth/funcionario',
        json={
            'funcionario': {
                'cpf': data_on_db['cpfs'][2],
                'orgao_pub': 1,
                'cargo': 1,
                'nome': 'nome test',
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'inicio_contrato': datetime(2000, 1, 1).isoformat(),
                'fim_contrato': None,
                'senha': 'secret test',
            },
            'contatos': {
                'emails': [
                    {'email': data_on_db['emails'][2]},
                    {'email': data_on_db['emails'][3]},
                ],
                'telefones': None,
            },
        },
    )

    assert rsp.status_code == HTTPStatus.CREATED

    result = db.read_raw_query(
        'SELECT * FROM FUNCIONARIO WHERE cpf = :cpf',
        {'cpf': data_on_db['cpfs'][2]},
    )
    assert len(result) == 1

    result = result[0]

    assert result['cpf'] == data_on_db['cpfs'][2]

    result = db.read_raw_query(
        'SELECT * FROM EMAIL WHERE email = :email',
        {'email': data_on_db['emails'][2]},
    )

    assert len(result) == 1

    result = result[0]

    assert result['cpf_func'] == data_on_db['cpfs'][2]


def test_auth_find_conflict_cpf(client, data_on_db):
    rsp = client.post(
        '/auth/morador',
        json={
            'morador': {
                'cpf': data_on_db['cpfs'][0],
                'nome': 'nome test',
                'cod_local': 1,
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'senha': 'secret test',
            },
            'contatos': {
                'emails': [
                    {'email': data_on_db['emails'][2]},
                    {'email': data_on_db['emails'][3]},
                ],
                'telefones': [
                    {'telefone': data_on_db['telefones'][2], 'ddd': '61'},
                    {'telefone': data_on_db['telefones'][3], 'ddd': '61'},
                ],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.CONFLICT
    assert rsp.json()['detail'] == 'cpf, allready exist in db'


def test_auth_find_conflict_email(
    client,
    data_on_db,
):
    rsp = client.post(
        '/auth/funcionario',
        json={
            'funcionario': {
                'cpf': data_on_db['cpfs'][2],
                'orgao_pub': 1,
                'cargo': 1,
                'nome': 'nome test',
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'inicio_contrato': datetime(2000, 1, 1).isoformat(),
                'fim_contrato': None,
                'senha': 'secret test',
            },
            'contatos': {
                'emails': [{'email': data_on_db['emails'][1]}],
                'telefones': None,
            },
        },
    )

    assert rsp.status_code == HTTPStatus.CONFLICT
    assert rsp.json()['detail'] == 'email, allready in use'


def test_auth_find_conflict_telefone(
    client,
    data_on_db,
):
    rsp = client.post(
        '/auth/morador',
        json={
            'morador': {
                'cpf': data_on_db['cpfs'][2],
                'nome': 'nome test',
                'cod_local': 1,
                'data_nasc': datetime(2000, 1, 1).isoformat(),
                'senha': 'secret test',
            },
            'contatos': {
                'emails': [{'email': data_on_db['emails'][2]}],
                'telefones': [
                    {'telefone': data_on_db['telefones'][0], 'ddd': '61'}
                ],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.CONFLICT
    assert rsp.json()['detail'] == 'telefone, allready in use'


def test_valid_email_cpf_and_telefone_with_invalid_email(
    client: TestClient, cpfs, telefones
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
            'contatos': {
                'emails': [{'email': 'invalid_email@bolinha'}],
                'telefones': [{'telefone': telefones[2], 'ddd': '61'}],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.BAD_REQUEST
    assert rsp.json()['detail'] == 'invalid email: invalid_email@bolinha'


def test_valid_email_cpf_and_telefone_with_invalid_telefone(
    client: TestClient, cpfs, emails
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
            'contatos': {
                'emails': [{'email': emails[2]}],
                'telefones': [{'telefone': '12345678p', 'ddd': '61'}],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.BAD_REQUEST
    assert rsp.json()['detail'] == 'invalid telefone.telefone: 12345678p'


def test_valid_email_cpf_and_telefone_with_invalid_telefone_ddd(
    client: TestClient, cpfs, emails
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
            'contatos': {
                'emails': [{'email': emails[2]}],
                'telefones': [{'telefone': '123456789', 'ddd': '615'}],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.BAD_REQUEST
    assert rsp.json()['detail'] == 'invalid telefone.ddd: 615'


def test_valid_email_cpf_and_telefone_with_invalid_cpf(
    client: TestClient, telefones, emails
):
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
            'contatos': {
                'emails': [{'email': emails[2]}],
                'telefones': [{'telefone': telefones[2], 'ddd': '61'}],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.BAD_REQUEST
    assert rsp.json()['detail'] == 'invalid cpf: 123.675'


def test_auth_login_post_with_morador(client: TestClient, data_on_db):

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


def test_auth_login_post_with_funcionario(client: TestClient, data_on_db):
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


def test_auth_login_with_email_not_found(client: TestClient, data_on_db):
    rsp = client.post(
        'auth/login',
        data={
            'username': data_on_db['emails'][2],
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

from datetime import datetime
from http import HTTPStatus

from fastapi.testclient import TestClient

from src.db.db import CollectorDB, DatabaseManager, Filter
from src.db.models import EmailDB, MoradorDB, TelefoneDB
from src.db.params import EqualTo
from src.service.security import verify_password_hash


def test_get_morador(client: TestClient, data_on_db):
    rsp = client.get(f'/morador/{data_on_db["cpfs"][0]}')

    assert rsp.status_code == HTTPStatus.OK

    data = rsp.json()

    assert data['morador']['cpf'] == data_on_db['morador']['cpf']
    assert data['contatos']['emails'][0]['email'] == data_on_db['emails'][0]
    assert (
        data['contatos']['telefones'][0]['telefone']
        == data_on_db['telefones'][0]
        or data['contatos']['telefones'][0]['telefone']
        == data_on_db['telefones'][1]
    )


def test_get_morador_without_morador(client: TestClient, data_on_db):
    rsp = client.get(f'/morador/{data_on_db["cpfs"][2]}')

    assert rsp.status_code == HTTPStatus.NOT_FOUND
    assert rsp.json()['detail'] == 'morador não encontrado'


def test_get_morador_without_telefone(client: TestClient, data_on_db):
    rsp = client.get(f'/morador/{data_on_db["cpfs"][3]}')

    assert rsp.status_code == HTTPStatus.OK

    data = rsp.json()

    assert data['morador']['cpf'] == data_on_db['cpfs'][3]
    assert data['contatos']['telefones'] == []


def test_update_morador(client: TestClient, data_on_db, db: DatabaseManager):
    qnt_emails = 2
    qnt_telefones = 2
    data_nasc = datetime(2000, 1, 1).isoformat()

    rsp = client.put(
        '/morador',
        json={
            'morador': {
                'cpf': data_on_db['morador']['cpf'],
                'nome': 'Bruno',
                'cod_local': 1,
                'data_nasc': data_nasc,
                'senha': 'nova_senha',
            },
            'contatos': {
                'emails': [
                    {'email': data_on_db['emails'][0]},
                    {'email': data_on_db['emails'][3]},
                ],
                'telefones': [
                    {'telefone': data_on_db['telefones'][0], 'ddd': '61'},
                    {'telefone': data_on_db['telefones'][3], 'ddd': '61'},
                ],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.ACCEPTED

    collector = CollectorDB(db)

    moradores_db = collector.collect_instances(
        Filter('morador', [EqualTo('cpf', data_on_db['morador']['cpf'])])
    )

    assert len(moradores_db) == 1
    assert isinstance(moradores_db[0], MoradorDB)

    morador_db = moradores_db[0]

    assert morador_db.cpf == data_on_db['morador']['cpf']
    assert morador_db.nome == 'Bruno'
    assert morador_db.data_nasc.isoformat() == data_nasc[:10]
    assert verify_password_hash('nova_senha', morador_db.senha)

    emails_db = collector.collect_instances(
        Filter('email', [EqualTo('cpf_morador', data_on_db['morador']['cpf'])])
    )

    assert len(emails_db) == qnt_emails
    assert isinstance(emails_db[0], EmailDB)
    assert isinstance(emails_db[1], EmailDB)
    assert (
        emails_db[0].email == data_on_db['emails'][0]
        or emails_db[1].email == data_on_db['emails'][0]
    )
    assert (
        emails_db[0].email == data_on_db['emails'][3]
        or emails_db[1].email == data_on_db['emails'][3]
    )

    telefones_db = collector.collect_instances(
        Filter(
            'telefone', [EqualTo('cpf_morador', data_on_db['morador']['cpf'])]
        )
    )

    assert len(telefones_db) == qnt_telefones
    assert isinstance(telefones_db[0], TelefoneDB)
    assert isinstance(telefones_db[1], TelefoneDB)
    assert (
        telefones_db[0].telefone == data_on_db['telefones'][0]
        or telefones_db[1].telefone == data_on_db['telefones'][0]
    )
    assert (
        telefones_db[0].telefone == data_on_db['telefones'][3]
        or telefones_db[1].telefone == data_on_db['telefones'][3]
    )


def test_update_morador_without_cpf_in_db(client: TestClient, data_on_db):
    rsp = client.put(
        '/morador',
        json={
            'morador': {
                'cpf': data_on_db['cpfs'][2],
                'nome': 'Bruno',
                'cod_local': 1,
                'data_nasc': '2000-01-01',
                'senha': 'senha',
            },
            'contatos': {
                'emails': [
                    {'email': 'email1@gmail.com'},
                    {'email': 'email2@gmail.com'},
                ],
                'telefones': [
                    {'telefone': '12345678901', 'ddd': '61'},
                    {'telefone': '12345678902', 'ddd': '61'},
                ],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.NOT_FOUND
    assert rsp.json()['detail'] == 'morador não encontrado'


def test_update_morador_without_telefone(client: TestClient, data_on_db):
    rsp = client.put(
        '/morador',
        json={
            'morador': {
                'cpf': data_on_db['morador']['cpf'],
                'nome': 'Bruno',
                'cod_local': 1,
                'data_nasc': '2000-01-01',
                'senha': 'senha',
            },
            'contatos': {
                'emails': [
                    {'email': 'email1@gmail.com'},
                    {'email': 'email2@gmail.com'},
                ],
                'telefones': None,
            },
        },
    )

    assert rsp.status_code == HTTPStatus.ACCEPTED


def test_update_morador_without_email(client: TestClient, data_on_db):
    rsp = client.put(
        '/morador',
        json={
            'morador': {
                'cpf': data_on_db['morador']['cpf'],
                'nome': 'Bruno',
                'cod_local': 1,
                'data_nasc': '2000-01-01',
                'senha': 'senha',
            },
            'contatos': {
                'emails': [],
                'telefones': [
                    {'telefone': '12345678901', 'ddd': '61'},
                    {'telefone': '12345678902', 'ddd': '61'},
                ],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.BAD_REQUEST
    assert rsp.json()['detail'] == 'emails vazios'


def test_update_morador_with_conflict_email(client: TestClient, data_on_db):
    rsp = client.put(
        '/morador',
        json={
            'morador': {
                'cpf': data_on_db['morador']['cpf'],
                'nome': 'Bruno',
                'cod_local': 1,
                'data_nasc': '2000-01-01',
                'senha': 'senha',
            },
            'contatos': {
                'emails': [
                    {'email': data_on_db['emails'][0]},
                    {'email': data_on_db['emails'][1]},
                ],
                'telefones': [
                    {'telefone': data_on_db['telefones'][0], 'ddd': '61'},
                    {'telefone': data_on_db['telefones'][2], 'ddd': '61'},
                ],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.CONFLICT
    assert (
        rsp.json()['detail']
        == f'O email: {data_on_db["emails"][1]}, já está em uso'
    )


def test_update_morador_with_conflict_telefone(client: TestClient, data_on_db):
    client.post(
        '/auth/morador',
        json={
            'morador': {
                'cpf': data_on_db['cpfs'][2],
                'nome': 'test',
                'cod_local': 1,
                'data_nasc': '2000-01-01',
                'senha': 'senha',
            },
            'contatos': {
                'emails': [
                    {'email': 'email1@gmail.com'},
                ],
                'telefones': [
                    {'telefone': data_on_db['telefones'][2], 'ddd': '61'},
                ],
            },
        },
    )

    rsp = client.put(
        '/morador',
        json={
            'morador': {
                'cpf': data_on_db['morador']['cpf'],
                'nome': 'Bruno',
                'cod_local': 1,
                'data_nasc': '2000-01-01',
                'senha': 'senha',
            },
            'contatos': {
                'emails': [
                    {'email': data_on_db['emails'][0]},
                    {'email': data_on_db['emails'][2]},
                ],
                'telefones': [
                    {'telefone': data_on_db['telefones'][0], 'ddd': '61'},
                    {'telefone': data_on_db['telefones'][2], 'ddd': '61'},
                ],
            },
        },
    )

    assert rsp.status_code == HTTPStatus.CONFLICT
    assert (
        rsp.json()['detail']
        == f'O telefone: {data_on_db["telefones"][2]}, já está em uso'
    )

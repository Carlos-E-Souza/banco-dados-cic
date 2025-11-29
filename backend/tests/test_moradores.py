from http import HTTPStatus

import pytest
from fastapi.testclient import TestClient


def test_get_morador(client: TestClient, data_on_db):
    rsp = client.get(f'/morador/get/{data_on_db["cpfs"][0]}')

    assert rsp.status_code == HTTPStatus.OK

    data = rsp.json()

    assert data['morador']['cpf'] == data_on_db['morador']['cpf']
    assert data['contatos']['emails'][0]['email'] == data_on_db['emails'][0]
    assert (
        data['contatos']['telefones'][0]['telefone']
        == data_on_db['telefones'][0]
    )


def test_get_morador_without_morador(client: TestClient, data_on_db):
    rsp = client.get(f'/morador/get/{data_on_db["cpfs"][2]}')

    assert rsp.status_code == HTTPStatus.NOT_FOUND
    assert rsp.json()['detail'] == 'morador não encontrado'


@pytest.mark.a
def test_get_morador_without_telefone(client: TestClient, data_on_db):
    rsp = client.get(f'/morador/get/{data_on_db["cpfs"][3]}')

    assert rsp.status_code == HTTPStatus.OK

    data = rsp.json()

    assert data['morador']['cpf'] == data_on_db['cpfs'][3]
    assert data['contatos']['telefones'] == []

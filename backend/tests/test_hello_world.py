from http import HTTPStatus

from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def test_hello_world():
    resp = client.get('/hello_world/')

    assert resp.status_code == HTTPStatus.OK

    data = resp.json()

    assert data['message'] == 'Hello World!'

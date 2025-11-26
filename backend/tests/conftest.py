import io
from datetime import datetime
from typing import Any
from unittest.mock import MagicMock

import pytest
from faker import Faker
from fastapi.testclient import TestClient
from PIL import Image
from testcontainers.mysql import MySqlContainer
from validate_docbr import CPF

from src.app import app
from src.db.db import DatabaseManager, SingletonDB
from src.db.models import (
    AvaliacaoDB,
    CargoDB,
    EmailDB,
    FotoFuncDB,
    FuncionarioDB,
    LocalDB,
    MoradorDB,
    OcorrenciaDB,
    OrgaoPublicoDB,
    ServicoDB,
    TelefoneDB,
    TipoOcorrenciaDB,
)


@pytest.fixture
def client(db):
    def get_session_override():
        return db

    with TestClient(app) as client:
        app.dependency_overrides[SingletonDB] = get_session_override
        yield client

    app.dependency_overrides.clear()
    return TestClient(app)


@pytest.fixture(scope='session')
def my_sql_container():
    mysql = MySqlContainer(
        'mysql:8.0',
        user='root',  # credencial root
        password='root',  # senha root
        dbname='PROJETO1BD',  # nome do banco criado automaticamente
        port=3306,  # opcional: você pode definir a porta
    )
    mysql.start()
    yield mysql
    mysql.stop()


@pytest.fixture
def db_url(my_sql_container):
    return my_sql_container.get_connection_url()


@pytest.fixture
def db(db_url: str):
    db = DatabaseManager(db_url, False)
    db.write_raw_query('DROP DATABASE IF EXISTS PROJETO1BD;')
    db.commit()
    db.create_schema_from_script()
    yield db
    db.connection.close()


@pytest.fixture
def mock_db():
    mock = MagicMock(spec=DatabaseManager)
    mock.connection = MagicMock()
    return mock


@pytest.fixture
def img():
    img = Image.new('RGB', (1, 1), 'red')
    buffer = io.BytesIO()

    img.save(buffer, 'PNG')
    buffer.seek(0)
    binary_data = buffer.read()

    return binary_data


@pytest.fixture
def faker() -> Faker:
    return Faker('pt_BR')


@pytest.fixture
def telefones(faker) -> list[str]:
    return [faker.cellphone_number() for _ in range(2)]


@pytest.fixture
def emails() -> list[str]:
    return ['test@gmail.com', 'test@outlook.com', 'test@yahoo.com']


@pytest.fixture
def cpfs():
    cpf = CPF()
    cpfs = cpf.generate_list(3)
    return cpfs


@pytest.fixture
def data_on_db(
    db: DatabaseManager, img: bytes, cpfs, emails, telefones
) -> dict[str, dict[str, Any]]:
    data = {
        'local': {
            'cod_local': 1,
            'estado': 'estado',
            'municipio': 'municipio',
            'bairro': 'bairro',
        },
        'morador': {
            'cpf': cpfs[0],
            'senha': 'secret test',
            'data_nasc': datetime(2000, 1, 1),
            'nome': 'test',
            'cod_local': 1,
        },
        'telefone': {
            'telefone': telefones[0][-9:],
            'cpf_morador': cpfs[0],
            'DDD': '61',
        },
        'email_morador': {
            'cpf_func': None,
            'cpf_morador': cpfs[0],
            'email': emails[0],
        },
        'orgao_publico': {
            'nome': 'orgão test',
            'estado': 'estado test',
            'descr': 'descr test',
            'data_ini': datetime(2000, 1, 1),
            'data_fim': None,
        },
        'cargo': {'nome': 'cargo test', 'descricao': 'descricao test'},
        'funcionario': {
            'cpf': cpfs[1],
            'nome': 'nome test',
            'orgao_pub': 1,
            'cargo': 1,
            'data_nasc': datetime(1980, 1, 1),
            'inicio_contrato': datetime(2000, 1, 1),
            'fim_contrato': None,
            'senha': 'scret test',
        },
        'email_func': {
            'cpf_func': cpfs[1],
            'cpf_morador': None,
            'email': emails[1],
        },
        'foto_func': {
            'cpf_func': cpfs[1],
            'imagem': img,
        },
        'servico': {
            'cod_orgao': 1,
            'cod_local': 1,
            'nome': 'nome test',
            'descr': 'descr',
            'inicio_servico': datetime(2000, 1, 1),
            'fim_servico': None,
        },
        'avaliacao': {
            'cod_servico': 1,
            'cpf_morador': cpfs[0],
            'nota_serv': 10,
            'nota_tempo': 5,
            'opiniao': 'nao gostei',
        },
        'tipo_ocorrencia': {
            'orgao_pub': 1,
            'nome': 'nome test',
            'descr': 'descr test',
        },
        'ocorrencia': {
            'cod_tipo': 1,
            'cod_local': 1,
            'cpf_morador': cpfs[0],
            'data': datetime(2000, 1, 1),
            'tipo_status': 'tipo_status test',
            'descr': 'descr test',
        },
    }
    LocalDB(db, data['local']).update()
    LocalDB(db, data['local']).update()

    MoradorDB(db, data['morador']).update()

    TelefoneDB(
        db,
        data['telefone'],
    ).update()

    EmailDB(
        db,
        data['email_morador'],
    ).update()

    OrgaoPublicoDB(
        db,
        data['orgao_publico'],
    ).update()

    CargoDB(db, data['cargo']).update()

    FuncionarioDB(
        db,
        data['funcionario'],
    ).update()

    EmailDB(
        db,
        data['email_func'],
    ).update()

    FotoFuncDB(
        db,
        data['foto_func'],
    ).update()

    ServicoDB(
        db,
        data['servico'],
    ).update()

    AvaliacaoDB(
        db,
        data['avaliacao'],
    ).update()

    TipoOcorrenciaDB(
        db,
        data['tipo_ocorrencia'],
    ).update()

    OcorrenciaDB(
        db,
        data['ocorrencia'],
    )

    db.commit()

    return data

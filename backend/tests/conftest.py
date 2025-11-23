from unittest.mock import MagicMock

import pytest
from testcontainers.mysql import MySqlContainer

from src.db.db import DatabaseManager
from src.db.models import LocalDB


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
def db_manager(db_url: str) -> DatabaseManager:
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
def db_with_data(db_manager: DatabaseManager) -> DatabaseManager:
    LocalDB(
        db_manager,
        {
            'estado': 'estado',
            'municipio': 'municipio',
            'bairro': 'bairro',
            'endereco': 'endereco',
        },
    ).update()
    LocalDB(
        db_manager,
        {
            'estado': 'estado',
            'municipio': 'municipio',
            'bairro': 'bairro',
            'endereco': 'endereco',
        },
    ).update()

    db_manager.commit()

    return db_manager

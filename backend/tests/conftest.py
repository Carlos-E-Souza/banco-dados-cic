from unittest.mock import MagicMock

import pytest
from testcontainers.mysql import MySqlContainer

from src.db.db import DatabaseManager
from src.interfaces.interfaces import DatabaseInterface


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
def db_manager(db_url: str):
    db = DatabaseManager(db_url, False)
    db.execute_raw_query('DROP DATABASE IF EXISTS PROJETO1BD;')
    db.create_schema_from_script()
    return db


@pytest.fixture
def mock_db():
    return MagicMock(spec=DatabaseInterface)

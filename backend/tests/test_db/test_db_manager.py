from pathlib import Path

import pytest
from sqlalchemy.exc import SQLAlchemyError

from src.db.db import DatabaseManager


def test_execute_raw_query_crud_sql(db_manager: DatabaseManager):
    db_manager.execute_raw_query('CREATE TABLE test(id INT, name TEXT)')
    db_manager.execute_raw_query(
        'INSERT INTO test VALUES(:id, :name)', {'id': 1, 'name': 'test'}
    )
    rows = db_manager.execute_raw_query('SELECT * FROM test')
    assert rows == [{'id': 1, 'name': 'test'}]

    db_manager.execute_raw_query(
        'UPDATE test SET name = :name WHERE id = :id',
        {'id': 1, 'name': 'updated'},
    )
    rows = db_manager.execute_raw_query('SELECT * FROM test')
    assert rows == [{'id': 1, 'name': 'updated'}]

    db_manager.execute_raw_query(
        'DELETE FROM test WHERE id = :id',
        {'id': 1},
    )
    rows = db_manager.execute_raw_query('SELECT * FROM test')
    assert rows == []


def test_execute_raw_query_invalid_sql(db_manager: DatabaseManager):
    try:
        db_manager.execute_raw_query('INVALID SQL STATEMENT')
    except SQLAlchemyError:
        assert True
    except Exception as e:
        pytest.fail(f'Unexpected exception type: {type(e)}')
    else:
        pytest.fail('Expected an exception for invalid SQL statement')


def test_create_schema_from_script_empty(db_manager: DatabaseManager, caplog):

    assert (
        db_manager.create_schema_from_script(Path('./tests/test_db/empty.sql'))
        is None
    )

    assert 'Queries SQL nao presentes em ' in caplog.text


def test_create_schema_from_script_not_found(db_manager: DatabaseManager):
    try:
        db_manager.create_schema_from_script(
            Path('./tests/test_db/non_existent.sql')
        )
    except FileNotFoundError:
        assert True
    except Exception as e:
        pytest.fail(f'Unexpected exception type: {type(e)}')
    else:
        pytest.fail('Expected a FileNotFoundError for missing SQL script')


def test_create_schema_from_script_invalid(
    db_manager: DatabaseManager, caplog
):
    try:
        db_manager.create_schema_from_script(Path('./tests/test_db/wrong.sql'))
    except SQLAlchemyError:
        assert True
    except Exception as e:
        pytest.fail(f'Unexpected exception type: {type(e)}')
    else:
        pytest.fail('Expected an exception for invalid SQL script')

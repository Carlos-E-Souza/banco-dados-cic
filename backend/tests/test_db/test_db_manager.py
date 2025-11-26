from pathlib import Path

import pytest
from sqlalchemy.exc import SQLAlchemyError

from src.db.db import DatabaseManager


def test_read_write_raw_query_crud_sql(db: DatabaseManager):
    db.write_raw_query('CREATE TABLE test(id INT, name TEXT)')
    db.write_raw_query(
        'INSERT INTO test VALUES(:id, :name)', {'id': 1, 'name': 'test'}
    )
    db.commit()

    rows = db.read_raw_query('SELECT * FROM test')
    assert rows == [{'id': 1, 'name': 'test'}]

    db.write_raw_query(
        'UPDATE test SET name = :name WHERE id = :id',
        {'id': 1, 'name': 'updated'},
    )
    db.commit()

    rows = db.read_raw_query('SELECT * FROM test')
    assert rows == [{'id': 1, 'name': 'updated'}]

    db.write_raw_query(
        'DELETE FROM test WHERE id = :id',
        {'id': 1},
    )
    db.commit()
    rows = db.read_raw_query('SELECT * FROM test')
    assert rows == []


def test_write_raw_query_invalid_sql(db: DatabaseManager):
    try:
        db.write_raw_query('INVALID SQL STATEMENT')
    except SQLAlchemyError:
        assert True
    except Exception as e:
        pytest.fail(f'Unexpected exception type: {type(e)}')
    else:
        pytest.fail('Expected an exception for invalid SQL statement')


def test_create_schema_from_script_empty(db: DatabaseManager, caplog):

    assert (
        db.create_schema_from_script(Path('./tests/test_db/empty.sql')) is None
    )

    assert 'Queries SQL nao presentes em ' in caplog.text


def test_create_schema_from_script_not_found(db: DatabaseManager):
    try:
        db.create_schema_from_script(Path('./tests/test_db/non_existent.sql'))
    except FileNotFoundError:
        assert True
    except Exception as e:
        pytest.fail(f'Unexpected exception type: {type(e)}')
    else:
        pytest.fail('Expected a FileNotFoundError for missing SQL script')


def test_create_schema_from_script_invalid(db: DatabaseManager, caplog):
    try:
        db.create_schema_from_script(Path('./tests/test_db/wrong.sql'))
    except SQLAlchemyError:
        assert True
    except Exception as e:
        pytest.fail(f'Unexpected exception type: {type(e)}')
    else:
        pytest.fail('Expected an exception for invalid SQL script')


def test_not_change_without_commit(db: DatabaseManager):
    db.write_raw_query('CREATE TABLE test(id INT, name TEXT)')
    db.write_raw_query(
        'INSERT INTO test VALUES(:id, :name)', {'id': 1, 'name': 'test'}
    )
    db.connection.commit()
    db.write_raw_query(
        'UPDATE test SET name = :name WHERE id = :id',
        {'id': 1, 'name': 'updated'},
    )
    assert db.read_raw_query('SELECT * FROM test') == [
        {'id': 1, 'name': 'test'}
    ]

    db.connection.commit()
    assert db.read_raw_query('SELECT * FROM test') == [
        {'id': 1, 'name': 'updated'}
    ]

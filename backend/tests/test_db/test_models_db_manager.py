from src.db.db import DatabaseManager
from src.db.models import LocalDB


def test_save_object_in_db(db_manager: DatabaseManager):

    local = LocalDB(
        db_manager,
        {
            'cod_local': 1,
            'estado': 'DF',
            'municipio': 'Brasília',
            'bairro': 'test',
            'endereco': 'Rua Teste, 123',
        },
    )

    local.update()
    db_manager.commit()

    result = db_manager.read_raw_query(
        'SELECT * FROM LOCALIDADE WHERE cod_local = :cod_local;',
        {'cod_local': 1},
    )

    assert result == [
        {
            'cod_local': 1,
            'estado': 'DF',
            'municipio': 'Brasília',
            'bairro': 'test',
            'endereco': 'Rua Teste, 123',
        }
    ]

    local.endereco = 'Rua Teste, 456'
    local.update()
    db_manager.commit()

    result = db_manager.read_raw_query(
        'SELECT * FROM LOCALIDADE WHERE cod_local = :cod_local;',
        {'cod_local': 1},
    )

    assert result == [
        {
            'cod_local': 1,
            'estado': 'DF',
            'municipio': 'Brasília',
            'bairro': 'test',
            'endereco': 'Rua Teste, 456',
        }
    ]

    local.delete()
    db_manager.commit()

    result = db_manager.read_raw_query(
        'SELECT * FROM LOCALIDADE WHERE cod_local = :cod_local;',
        {'cod_local': 1},
    )

    assert result == []

    local.update()
    db_manager.commit()

    result = db_manager.read_raw_query(
        'SELECT * FROM LOCALIDADE WHERE cod_local = :cod_local'
        + ' OR cod_local = 2;',
        {'cod_local': 1},
    )

    assert result == [
        {
            'cod_local': 2,
            'estado': 'DF',
            'municipio': 'Brasília',
            'bairro': 'test',
            'endereco': 'Rua Teste, 456',
        }
    ]

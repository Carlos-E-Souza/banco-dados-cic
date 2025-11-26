from src.db.db import DatabaseManager
from src.db.models import LocalDB


def test_save_object_in_db(db: DatabaseManager):

    local = LocalDB(
        db,
        {
            'cod_local': 1,
            'estado': 'DF',
            'municipio': 'Brasília',
            'bairro': 'test',
            'endereco': 'Rua Teste, 123',
        },
    )

    local.update()
    db.commit()

    result = db.read_raw_query(
        'SELECT * FROM LOCALIDADE WHERE cod_local = :cod_local;',
        {'cod_local': 1},
    )

    assert result == [
        {
            'cod_local': 1,
            'estado': 'DF',
            'municipio': 'Brasília',
            'bairro': 'test',
        }
    ]

    local.bairro = 'Test'
    local.update()
    db.commit()

    result = db.read_raw_query(
        'SELECT * FROM LOCALIDADE WHERE cod_local = :cod_local;',
        {'cod_local': 1},
    )

    assert result == [
        {
            'cod_local': 1,
            'estado': 'DF',
            'municipio': 'Brasília',
            'bairro': 'Test',
        }
    ]

    local.delete()
    db.commit()

    result = db.read_raw_query(
        'SELECT * FROM LOCALIDADE WHERE cod_local = :cod_local;',
        {'cod_local': 1},
    )

    assert result == []

    local.update()
    db.commit()

    result = db.read_raw_query(
        'SELECT * FROM LOCALIDADE WHERE cod_local = :cod_local'
        + ' OR cod_local = 2;',
        {'cod_local': 1},
    )

    assert result == [
        {
            'cod_local': 2,
            'estado': 'DF',
            'municipio': 'Brasília',
            'bairro': 'Test',
        }
    ]

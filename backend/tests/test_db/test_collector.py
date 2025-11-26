from typing import Sequence

import pytest

from src.db.db import CollectorDB, Filter
from src.db.models import LocalDB, ObjectDBInterface
from src.db.params import OrderBy


def test_collector(db, data_on_db):
    qnt_of_locals = 2
    collector = CollectorDB(db)
    filter = Filter((LocalDB.name).lower(), [OrderBy('cod_local', 'ASC')])

    result: Sequence[LocalDB | ObjectDBInterface] = (
        collector.collect_instances(filter)
    )

    if not (isinstance(result[0], LocalDB) and isinstance(result[1], LocalDB)):
        pytest.fail('Instance not is the correct type.')

    assert result[0].cod_local == data_on_db['local']['cod_local']
    assert result[0].estado == data_on_db['local']['estado']
    assert result[0].municipio == data_on_db['local']['municipio']
    assert result[0].bairro == data_on_db['local']['bairro']

    assert result[1].cod_local == qnt_of_locals

from typing import Sequence

import pytest

from src.db.db import CollectorDB, Filter
from src.db.filters import OrderBy
from src.db.models import LocalDB, ObjectDBInterface


def test_collector(db_with_data):
    qnt_of_locals = 2
    collector = CollectorDB(db_with_data)
    filter = Filter((LocalDB.name).lower(), [OrderBy('cod_local', 'ASC')])

    result: Sequence[LocalDB | ObjectDBInterface] = (
        collector.collect_instances(filter)
    )

    if not (isinstance(result[0], LocalDB) and isinstance(result[1], LocalDB)):
        pytest.fail('Instance not is the correct type.')

    assert result[0].cod_local == 1
    assert result[0].estado == 'estado'
    assert result[0].municipio == 'municipio'
    assert result[0].bairro == 'bairro'

    assert result[1].cod_local == qnt_of_locals

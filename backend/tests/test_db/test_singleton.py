from src.db.db import SingletonDB
from src.interfaces.interfaces import DatabaseInterface


def test_singleton_db(db_url: str):
    assert SingletonDB._instance is None

    instance1 = SingletonDB(db_url)
    instance2 = SingletonDB(db_url)

    assert SingletonDB._instance is instance1
    assert instance1 is instance2
    assert isinstance(instance1, DatabaseInterface)

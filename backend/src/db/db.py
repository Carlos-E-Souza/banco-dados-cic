import logging
from pathlib import Path
from typing import Any, Iterable, List, Optional, Sequence

from sqlalchemy import TextClause, create_engine, text
from sqlalchemy.engine import Engine, Result
from sqlalchemy.exc import SQLAlchemyError

from src.db.driver_patch import *  # noqa: F403,F401
from src.interfaces.interfaces import (
    CollectorInterface,
    DatabaseInterface,
    FactoryObjectDBInterface,
    Filter,
    ObjectDBInterface,
    SingletonDBInterface,
    SpecificFactoryInterface,
)

logger = logging.getLogger(__name__)


class DatabaseManager(DatabaseInterface):
    def __init__(self, database_url: str, echo: bool = True) -> None:
        self.database_url = database_url
        self.engine: Engine = create_engine(
            database_url, echo=echo, future=True
        )

    def create_schema_from_script(
        self, script_path: Optional[Path] = None
    ) -> None:
        resolved_path = self._resolve_script_path(script_path)
        statements = self._load_statements(resolved_path)

        if not statements:
            logger.warning('Queries SQL nao presentes em %s', resolved_path)
            return

        with self.engine.connect() as connection:
            for statement in statements:
                try:
                    connection.execute(text(statement))
                except SQLAlchemyError as exc:
                    logger.exception('Erro ao executar query: %s', statement)
                    raise exc from exc
            connection.commit()

    def execute_raw_query(
        self, raw_sql: str | TextClause, params: Optional[dict] = None
    ) -> Sequence[dict[str, Any]]:
        with self.engine.connect() as connection:
            if isinstance(raw_sql, str):
                raw_sql = text(raw_sql)

            result: Result = connection.execute(raw_sql, params or {})

            if not result.returns_rows:
                connection.commit()
                return []

            return [dict(row) for row in result.mappings()]

    @staticmethod
    def _resolve_script_path(script_path: Optional[Path]) -> Path:
        if script_path is not None:
            return script_path.resolve()

        default_path = Path(__file__).resolve().parents[3] / 'gerarTabelas.sql'
        return default_path

    @staticmethod
    def _load_statements(path: Path) -> List[str]:
        try:
            raw_content = path.read_text(encoding='utf-8')
        except FileNotFoundError as exc:
            logger.exception('Schema script not found at %s', path)
            raise exc from exc

        return [
            statement
            for statement in DatabaseManager._split_sql(raw_content)
            if statement
        ]

    @staticmethod
    def _split_sql(raw_sql: str) -> Iterable[str]:
        buffer: List[str] = []
        for line in raw_sql.splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith('--'):
                continue

            buffer.append(line)
            if stripped.endswith(';'):
                statement = '\n'.join(buffer).strip().rstrip(';')
                buffer.clear()
                yield statement

        if buffer:
            yield '\n'.join(buffer).strip()


class SingletonDB(SingletonDBInterface):
    _instance: Optional[DatabaseManager] = None

    def __new__(cls, database_url: str):
        if cls._instance is None:
            cls._instance = DatabaseManager(database_url)
        return cls._instance


registry: dict[str, type[SpecificFactoryInterface]] = {}


class FactoryObjectDB(FactoryObjectDBInterface):
    def __init__(
        self, registry: dict[str, type[SpecificFactoryInterface]] = registry
    ) -> None:
        self.registry = registry

    def create_instance(
        self, type: str, data: dict[str, Any]
    ) -> ObjectDBInterface:
        if type not in self.registry:
            raise ValueError(f'Unknown object type: {type}')

        obj_class = self.registry[type]
        return obj_class(data)


class CollectorDB(CollectorInterface):
    def __init__(self, db_manager: DatabaseManager) -> None:
        self.db_manager = db_manager

    def collect_instances(self, filter: Filter) -> Sequence[ObjectDBInterface]:
        sql_query: str = f'SELECT * FROM {filter.object_type} WHERE 1=1'

        parms: List[str] = [
            param.make_sql_condition() for param in filter.params
        ]

        sql_query += ' ' + ' '.join(str(p) for p in parms)

        results = self.db_manager.execute_raw_query(sql_query)
        objects: List[ObjectDBInterface] = []

        for row in results:
            obj = FactoryObjectDB().create_instance(filter.object_type, row)
            objects.append(obj)

        return objects

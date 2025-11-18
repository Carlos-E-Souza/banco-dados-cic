import logging
from pathlib import Path
from typing import Any, Iterable, List, Optional, Sequence

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, Result
from sqlalchemy.exc import SQLAlchemyError

from interfaces.interfaces import (
    CollectorInterface,
    DatabaseInterface,
    Filter,
    ObjectDBInterface,
    SingletonDBInterface,
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
            logger.warning('Queies SQL nao presentes em %s', resolved_path)
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
        self, raw_sql: str, params: Optional[dict] = None
    ) -> Sequence[dict[str, Any]]:
        with self.engine.connect() as connection:
            result: Result = connection.execute(text(raw_sql), params or {})
            connection.commit()

            if not result.returns_rows:
                return []

            return [dict(row) for row in result.mappings()]

    @staticmethod
    def _resolve_script_path(script_path: Optional[Path]) -> Path:
        if script_path is not None:
            return script_path.resolve()

        default_path = (
            Path(__file__).resolve().parents[2] / 'gerarTabelasPstg.sql'
        )
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
    _instance: Optional['SingletonDB'] = None

    def __init__(self, database_url: str) -> None:
        if not hasattr(self, 'initialized'):
            self.database_manager = DatabaseManager(database_url)
            self.initialized = True

    def get_instance(self) -> DatabaseManager:
        return self.database_manager


class CollectorDB(CollectorInterface):
    def __init__(self, db_manager: DatabaseManager) -> None:
        self.db_manager = db_manager

    def collect_data(self, filter: Filter) -> Sequence[ObjectDBInterface]:
        sql_query: str = f'SELECT * FROM {filter.object_type} WHERE 1=1'
        for param in filter.params:
            logger.debug(
                'Collecting data for %s where %s %s',
                filter.object_type,
                param.field,
                param.value,
            )

            sql_query += f' AND {param.make_sql_condition(len(param.field))}'

        results = self.db_manager.execute_raw_query(sql_query)
        objects: List[ObjectDBInterface] = []

        for row in results:
            obj = filter.object_type(**row)
            objects.append(obj)

        return objects

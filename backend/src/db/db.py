import logging
from pathlib import Path
from typing import Any, Iterable, List, Optional, Sequence

from sqlalchemy import TextClause, create_engine, text
from sqlalchemy.engine import Connection, Engine, Result
from sqlalchemy.exc import SQLAlchemyError

from src.db.driver_patch import *  # noqa: F403,F401
from src.db.models import (
    AvaliacaoDB,
    CargoDB,
    EmailDB,
    FotoFuncDB,
    FuncionarioDB,
    LocalDB,
    MoradorDB,
    OcorrenciaDB,
    OrgaoPublicoDB,
    ServicoDB,
    TelefoneDB,
    TipoOcorrenciaDB,
)
from src.interfaces.interfaces import (
    CollectorInterface,
    DatabaseInterface,
    FactoryObjectDBInterface,
    Filter,
    ObjectDBInterface,
    SingletonDBInterface,
)
from src.settings import Settings

logger = logging.getLogger(__name__)


class DatabaseManager(DatabaseInterface):
    def __init__(self, database_url: str, echo: bool = True) -> None:
        self.database_url = database_url
        self.engine: Engine = create_engine(
            database_url, echo=echo, future=True
        )
        self.connection: Connection = self.engine.connect()

    def create_schema_from_script(
        self, script_path: Optional[Path] = None
    ) -> None:
        resolved_path = self._resolve_script_path(script_path)
        statements = self._load_statements(resolved_path)

        if not statements:
            logger.warning('Queries SQL nao presentes em %s', resolved_path)
            return

        for statement in statements:
            try:
                self.connection.execute(text(statement))
            except SQLAlchemyError as exc:
                logger.exception('Erro ao executar query: %s', statement)
                raise exc from exc

    def read_raw_query(
        self, raw_sql: str | TextClause, params: Optional[dict] = None
    ) -> Sequence[dict[str, Any]]:
        with self.engine.connect() as connection:
            if isinstance(raw_sql, str):
                raw_sql = text(raw_sql)

            result: Result = connection.execute(raw_sql, params or {})

            return [dict(row) for row in result.mappings()]

    def write_raw_query(
        self, raw_sql: str | TextClause, params: Optional[dict] = None
    ) -> None:
        if isinstance(raw_sql, str):
            raw_sql = text(raw_sql)

        self.connection.execute(raw_sql, params or {})

    def commit(self) -> None:
        self.connection.commit()

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

    def __new__(cls, database_url: str = Settings().DB_URL):  # type: ignore
        if cls._instance is None:
            cls._instance = DatabaseManager(database_url, False)
        return cls._instance


registry: dict[str, type[ObjectDBInterface]] = {
    'avaliacao': AvaliacaoDB,
    'cargo': CargoDB,
    'email': EmailDB,
    'foto_func': FotoFuncDB,
    'funcionario': FuncionarioDB,
    'localidade': LocalDB,
    'morador': MoradorDB,
    'ocorrencia': OcorrenciaDB,
    'orgao_publico': OrgaoPublicoDB,
    'servico': ServicoDB,
    'telefone': TelefoneDB,
    'tipo_ocorrencia': TipoOcorrenciaDB,
}


class FactoryObjectDB(FactoryObjectDBInterface):
    def __init__(
        self, registry: dict[str, type[ObjectDBInterface]] = registry
    ) -> None:
        self.registry = registry

    def create_instance(
        self,
        type: str,
        data: dict[str, Any],
        db: DatabaseInterface,
        in_db: bool = False,
    ) -> ObjectDBInterface:
        if type not in self.registry:
            raise ValueError(f'Unknown object type: {type}')

        obj_class = self.registry[type]
        return obj_class(db, data, in_db)  # type: ignore


class CollectorDB(CollectorInterface):
    def __init__(self, db_manager: DatabaseManager) -> None:
        self.db_manager = db_manager

    def collect_instances(self, filter: Filter) -> list[ObjectDBInterface]:
        sql_query: str = (
            f'SELECT * FROM {filter.object_type.upper()} ' + 'WHERE 1=1'
        )

        params: List[str] = [
            param.make_sql_condition()[0] for param in filter.params
        ]

        params_dict: dict[str, Any] = {}

        for param in filter.params:
            params_dict.update(param.make_sql_condition()[1])

        sql_query += ' ' + ' '.join(params)

        results = self.db_manager.read_raw_query(sql_query, params_dict)
        objects: List[ObjectDBInterface] = []
        factory = FactoryObjectDB()

        for row in results:
            obj = factory.create_instance(
                filter.object_type.lower(), row, self.db_manager, True
            )
            objects.append(obj)

        return objects

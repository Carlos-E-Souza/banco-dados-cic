import logging
from pathlib import Path
from typing import Any, Iterable, List, Optional, Sequence

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, Result
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


class DatabaseManager:
	
	def __init__(self, database_url: str, echo: bool = True) -> None:
		self.database_url = database_url
		self.engine: Engine = create_engine(database_url, echo=echo, future=True)

	def create_schema_from_script(self, script_path: Optional[Path] = None) -> None:
		resolved_path = self._resolve_script_path(script_path)
		statements = self._load_statements(resolved_path)

		if not statements:
			logger.warning("Queies SQL nao presentes em %s", resolved_path)
			return

		with self.engine.connect() as connection:
			for statement in statements:
				try:
					connection.execute(text(statement))
				except SQLAlchemyError as exc:
					logger.exception("Erro ao executar query: %s", statement)
					raise exc from exc
			connection.commit()

	def execute_raw_query(self, raw_sql: str, params: Optional[dict] = None) -> Sequence[dict[str, Any]]:
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

		default_path = Path(__file__).resolve().parents[2] / "gerarTabelasPstg.sql"
		return default_path

	@staticmethod
	def _load_statements(path: Path) -> List[str]:
		try:
			raw_content = path.read_text(encoding="utf-8")
		except FileNotFoundError as exc:
			logger.exception("Schema script not found at %s", path)
			raise exc from exc

		return [statement for statement in DatabaseManager._split_sql(raw_content) if statement]

	@staticmethod
	def _split_sql(raw_sql: str) -> Iterable[str]:
		buffer: List[str] = []
		for line in raw_sql.splitlines():
			stripped = line.strip()
			if not stripped or stripped.startswith("--"):
				continue

			buffer.append(line)
			if stripped.endswith(";"):
				statement = "\n".join(buffer).strip().rstrip(";")
				buffer.clear()
				yield statement

		if buffer:
			yield "\n".join(buffer).strip()

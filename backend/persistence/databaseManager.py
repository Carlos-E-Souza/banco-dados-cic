import logging
from typing import Any, Optional, Sequence

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, Result

logger = logging.getLogger(__name__)


class DatabaseManager:
	
	def __init__(self, database_url: str, echo: bool = True) -> None:
		self.database_url = database_url
		self.engine: Engine = create_engine(database_url, echo=echo, future=True)


	def execute_raw_query(self, raw_sql: str, params: Optional[dict] = None) -> Sequence[dict[str, Any]]:
		with self.engine.connect() as connection:
			result: Result = connection.execute(text(raw_sql), params or {})
			connection.commit()

			if not result.returns_rows:
				return []

			return [dict(row) for row in result.mappings()]

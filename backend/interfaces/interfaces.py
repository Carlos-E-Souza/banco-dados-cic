from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Type


class DatabaseInterface(ABC):
    @abstractmethod
    def create_schema_from_script(
        self, script_path: Optional[str] = None
    ) -> None:
        pass

    @abstractmethod
    def execute_raw_query(
        self, raw_sql: str, params: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        pass


class SingletonDBInterface(ABC):
    @abstractmethod
    def get_instance(self) -> DatabaseInterface:
        pass


class ObjectDBInterface(ABC):
    @abstractmethod
    def save(self) -> None:
        pass

    @abstractmethod
    def delete(self) -> None:
        pass


@dataclass
class Param(ABC):
    field: str
    value: Any

    @abstractmethod
    def make_sql_condition(self, index: int) -> str:
        pass


@dataclass
class Filter:
    object_type: Type[ObjectDBInterface]
    params: List[Param]


class CollectorInterface(ABC):
    @abstractmethod
    def collect_data(self, filter: Filter) -> Sequence[ObjectDBInterface]:
        pass

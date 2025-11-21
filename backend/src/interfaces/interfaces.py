from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import (
    Any,
    Dict,
    List,
    Literal,
    Optional,
    Sequence,
)


@dataclass
class DatabaseInterface(ABC):
    @abstractmethod
    def create_schema_from_script(
        self, script_path: Optional[str] = None
    ) -> None:
        pass  # pragma: no cover

    @abstractmethod
    def execute_raw_query(
        self, raw_sql: str, params: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        pass  # pragma: no cover


class SingletonDBInterface(ABC):
    @abstractmethod
    def __new__(cls) -> DatabaseInterface:
        pass  # pragma: no cover


class ObjectDBInterface(ABC):
    @abstractmethod
    def update(self) -> None:
        pass  # pragma: no cover

    @abstractmethod
    def delete(self) -> None:
        pass  # pragma: no cover


class FactoryObjectDBInterface(ABC):
    @abstractmethod
    def create_instance(
        self, type: str, data: Dict[str, Any], db: DatabaseInterface
    ) -> ObjectDBInterface:
        pass  # pragma: no cover


class SpecificFactoryInterface(ABC):
    @abstractmethod
    def __new__(
        cls, db: DatabaseInterface, data: Dict[str, Any]
    ) -> ObjectDBInterface:
        pass  # pragma: no cover


@dataclass
class Param(ABC):
    field: str
    value: Any
    operator_logic: Literal['AND', 'OR']

    @abstractmethod
    def make_sql_condition(self) -> str:
        pass  # pragma: no cover


@dataclass
class Filter:
    object_type: str
    params: List[Param] = field(default_factory=list)


class CollectorInterface(ABC):
    @abstractmethod
    def collect_instances(self, filter: Filter) -> Sequence[ObjectDBInterface]:
        pass  # pragma: no cover

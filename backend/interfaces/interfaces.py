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
        pass

    @abstractmethod
    def execute_raw_query(
        self, raw_sql: str, params: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        pass


class SingletonDBInterface(ABC):
    @abstractmethod
    def __new__(cls) -> DatabaseInterface:
        pass


class ObjectDBInterface(ABC):
    @abstractmethod
    def update(self) -> None:
        pass

    @abstractmethod
    def delete(self) -> None:
        pass


class FactoryObjectDBInterface(ABC):
    @abstractmethod
    def create_instance(
        self, type: str, data: Dict[str, Any]
    ) -> ObjectDBInterface:
        pass


class SpecificFactoryInterface(ABC):
    @abstractmethod
    def __new__(cls, data: Dict[str, Any]) -> ObjectDBInterface:
        pass


@dataclass
class Param(ABC):
    field: str
    value: Any
    operator_logic: Literal['AND', 'OR']

    @abstractmethod
    def make_sql_condition(self) -> str:
        pass


@dataclass
class Filter:
    object_type: str
    params: List[Param] = field(default_factory=list)


class CollectorInterface(ABC):
    @abstractmethod
    def collect_instances(self, filter: Filter) -> Sequence[ObjectDBInterface]:
        pass

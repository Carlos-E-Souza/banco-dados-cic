from typing import Any, Literal

from src.interfaces.interfaces import Param


class Greater(Param):
    def make_sql_condition(self) -> tuple[str, dict[str, Any]]:
        return (
            f'{self.operator_logic} {self.field} > :{self.field}',
            {self.field: self.value},
        )


class LessThan(Param):
    def make_sql_condition(self) -> tuple[str, dict[str, Any]]:
        return (
            f'{self.operator_logic} {self.field} < :{self.field}',
            {self.field: self.value},
        )


class EqualTo(Param):
    def make_sql_condition(self) -> tuple[str, dict[str, Any]]:
        return (
            f'{self.operator_logic} {self.field} = :{self.field}',
            {self.field: self.value},
        )


class Like(Param):
    def make_sql_condition(self) -> tuple[str, dict[str, Any]]:
        return (
            f'{self.operator_logic} {self.field} LIKE :{self.field}',
            {self.field: self.value},
        )


class OrderBy(Param):
    def __init__(
        self, field: str, operator_logic: Literal['ASC', 'DESC'] = 'ASC'
    ) -> None:
        super().__init__(field, '', operator_logic)

    def make_sql_condition(self) -> tuple[str, dict[str, Any]]:
        return f'ORDER BY {self.field} {self.operator_logic}', {}


class ParenthesesO(Param):
    def __init__(self) -> None:
        super().__init__('', '', '')

    @staticmethod
    def make_sql_condition() -> tuple[str, dict[str, Any]]:
        return '(', {}


class ParenthesesC(Param):
    def __init__(self) -> None:
        super().__init__('', '', '')

    @staticmethod
    def make_sql_condition() -> tuple[str, dict[str, Any]]:
        return ')', {}

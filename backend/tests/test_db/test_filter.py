from src.db.params import (
    EqualTo,
    Greater,
    LessThan,
    Like,
    OrderBy,
    ParenthesesC,
    ParenthesesO,
)
from src.interfaces.interfaces import Filter


def test_param_EqualTo():
    param = EqualTo('field', 'value', 'OR')
    assert param.make_sql_condition() == (
        'OR field = :field',
        {'field': 'value'},
    )


def test_param_Greater():
    param = Greater('field', 'value', 'AND')
    assert param.make_sql_condition() == (
        'AND field > :field',
        {'field': 'value'},
    )


def test_param_LessThan():
    param = LessThan('field', 'value', 'AND')
    assert param.make_sql_condition() == (
        'AND field < :field',
        {'field': 'value'},
    )


def test_param_Like():
    param = Like('field', 'value', 'AND')
    assert param.make_sql_condition() == (
        'AND field LIKE :field',
        {'field': 'value'},
    )


def test_param_OrderBy():
    param = OrderBy('field', 'ASC')
    assert param.make_sql_condition() == (
        'ORDER BY field ASC',
        {},
    )


def test_param_ParenthesesO():
    param = ParenthesesO()
    assert param.make_sql_condition() == ('(', {})


def test_param_ParenthesesC():
    param = ParenthesesC()
    assert param.make_sql_condition() == (')', {})


def test_filter():
    filter = Filter(
        'table',
        [
            ParenthesesO(),
            EqualTo('field', 'value', 'OR'),
            Greater('field', 'value'),
            LessThan('field', 'value'),
            Like('field', 'value'),
            ParenthesesC(),
            OrderBy('field', 'ASC'),
        ],
    )
    assert filter.object_type == 'table'
    assert filter.params == [
        ParenthesesO(),
        EqualTo('field', 'value', 'OR'),
        Greater('field', 'value'),
        LessThan('field', 'value'),
        Like('field', 'value'),
        ParenthesesC(),
        OrderBy('field', 'ASC'),
    ]
    assert (
        ' '.join(p.make_sql_condition()[0] for p in filter.params)
        == '( OR field = :field AND field > :field AND field'
        + ' < :field AND field LIKE :field ) ORDER BY field ASC'
    )

    dict_params = {}
    for p in filter.params:
        dict_params.update(p.make_sql_condition()[1])

    assert dict_params == {'field': 'value'}

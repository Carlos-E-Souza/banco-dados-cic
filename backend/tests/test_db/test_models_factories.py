import pytest

from src.db.db import FactoryObjectDB
from src.db.models import (
    AvaliacaoDB,
    CargoDB,
    EmailDB,
    FuncionarioDB,
    LocalDB,
    MoradorDB,
    OcorrenciaDB,
    OrgaoPublicoDB,
    ServicoDB,
    TelefoneDB,
    TipoOcorrenciaDB,
)


def test_avaliacao_factory_and_model(mock_db):
    data = {
        'cod_servico': 2,
        'cod_morador': 3,
        'nota_serv': 5,
        'nota_tempo': 4,
        'opiniao': 'Good',
    }
    obj: AvaliacaoDB = FactoryObjectDB().create_instance(
        'avaliacao', data, mock_db
    )
    assert isinstance(obj, AvaliacaoDB)
    assert obj.table_name == 'AVALIACAO'
    assert obj.cod_aval is None
    assert obj.nota_serv == data['nota_serv']


def test_cargo_factory_and_model(mock_db):
    data = {
        'nome': 'Manager',
        'descricao': 'Manages things',
    }
    obj: CargoDB = FactoryObjectDB().create_instance('cargo', data, mock_db)
    assert isinstance(obj, CargoDB)
    assert obj.table_name == 'CARGO'
    assert obj.cod_cargo is None
    assert obj.nome == 'Manager'


def test_email_factory_and_model(mock_db):
    data = {
        'cod_email': 1,
        'cod_func': 2,
        'cod_morador': None,
        'email': 'test@example.com',
    }
    obj: EmailDB = FactoryObjectDB().create_instance('email', data, mock_db)
    assert isinstance(obj, EmailDB)
    assert obj.table_name == 'EMAIL'
    assert obj.cod_email is None
    assert obj.email == 'test@example.com'


def test_funcionario_factory_and_model(mock_db):
    data = {
        'cod_func': 1,
        'orgao_pub': 2,
        'cargo': 3,
        'cpf': '12345678901',
        'data_nasc': '1990-01-01',
        'inicio_contrato': '2020-01-01',
        'fim_contrato': None,
    }
    obj: FuncionarioDB = FactoryObjectDB().create_instance(
        'funcionario', data, mock_db
    )
    assert isinstance(obj, FuncionarioDB)
    assert obj.table_name == 'FUNCIONARIO'
    assert obj.cod_func is None
    assert obj.cpf == '12345678901'


def test_local_factory_and_model(mock_db):
    data = {
        'cod_local': 1,
        'estado': 'DF',
        'municipio': 'Brasilia',
        'bairro': 'Asa Norte',
        'endereco': 'SQN 102',
    }
    obj: LocalDB = FactoryObjectDB().create_instance(
        'localidade', data, mock_db
    )
    assert isinstance(obj, LocalDB)
    assert obj.table_name == 'LOCALIDADE'
    assert obj.cod_local is None
    assert obj.estado == 'DF'


def test_ocorrencia_factory_and_model(mock_db):
    data = {
        'cod_oco': 1,
        'cod_tipo': 2,
        'cod_local': 3,
        'cod_morador': 4,
        'data': '2023-01-01',
        'status': 'OPEN',
    }
    obj: OcorrenciaDB = FactoryObjectDB().create_instance(
        'ocorrencia', data, mock_db
    )
    assert isinstance(obj, OcorrenciaDB)
    assert obj.table_name == 'OCORRENCIA'
    assert obj.cod_oco is None
    assert obj.status == 'OPEN'


def test_orgao_publico_factory_and_model(mock_db):
    data = {
        'cod_orgao': 1,
        'nome': 'Orgao 1',
        'estado': 'DF',
        'descr': 'Desc',
        'data_ini': '2000-01-01',
        'data_fim': None,
    }
    obj: OrgaoPublicoDB = FactoryObjectDB().create_instance(
        'orgao_publico', data, mock_db
    )
    assert isinstance(obj, OrgaoPublicoDB)
    assert obj.table_name == 'ORGAO_PUBLICO'
    assert obj.cod_orgao is None
    assert obj.nome == 'Orgao 1'


def test_morador_factory_and_model(mock_db):
    data = {
        'cod_morador': 1,
        'endereco': 2,
        'cpf': '00000000000',
        'data_nasc': '2000-01-01',
    }
    obj: MoradorDB = FactoryObjectDB().create_instance(
        'morador', data, mock_db
    )
    assert isinstance(obj, MoradorDB)
    assert obj.table_name == 'MORADOR'
    assert obj.cod_morador is None
    assert obj.cpf == '00000000000'


def test_servico_factory_and_model(mock_db):
    data = {
        'cod_servico': 1,
        'cod_orgao': 2,
        'cod_local': 3,
        'nome': 'Servico 1',
        'descr': 'Desc',
        'inicio_servico': '2023-01-01',
        'fim_servico': None,
    }
    obj: ServicoDB = FactoryObjectDB().create_instance(
        'servico', data, mock_db
    )
    assert isinstance(obj, ServicoDB)
    assert obj.table_name == 'SERVICO'
    assert obj.cod_servico is None
    assert obj.nome == 'Servico 1'


def test_telefone_factory_and_model(mock_db):
    data = {'telefone': '99999999', 'cod_morador': 1, 'DDD': '61'}
    obj: TelefoneDB = FactoryObjectDB().create_instance(
        'telefone', data, mock_db
    )
    assert isinstance(obj, TelefoneDB)
    assert obj.table_name == 'TELEFONE'
    assert obj.telefone == '99999999'
    assert obj.DDD == '61'


def test_tipo_ocorrencia_factory_and_model(mock_db):
    data = {
        'cod_tipo': 1,
        'orgao_pub': 2,
        'nome': 'Tipo 1',
        'descr': 'Desc',
    }
    obj: TipoOcorrenciaDB = FactoryObjectDB().create_instance(
        'tipo_ocorrencia', data, mock_db
    )
    assert isinstance(obj, TipoOcorrenciaDB)
    assert obj.table_name == 'TIPO_OCORRENCIA'
    assert obj.cod_tipo is None
    assert obj.nome == 'Tipo 1'


def test_objetodb_sql_generation(mock_db):
    data = {'cod_cargo': 1, 'nome': 'Manager', 'descricao': 'Manages things'}
    obj: CargoDB = FactoryObjectDB().create_instance(
        'cargo', data, mock_db, False
    )
    assert not obj._in_db

    # Test Insert
    mock_db.connection.execute.return_value.lastrowid = 1
    obj.update()
    mock_db.connection.execute.assert_called()
    args, _ = mock_db.connection.execute.call_args
    args, sttm = str(args[0]), args[1]
    assert 'INSERT INTO CARGO' in args
    assert 'nome' in args
    assert 'descricao' in args
    assert {'nome': 'Manager', 'descricao': 'Manages things'} == sttm
    assert obj._in_db

    # Test Update
    obj.nome = 'Director'
    obj.update()
    args, _ = mock_db.write_raw_query.call_args
    args, sttm = str(args[0]), args[1]
    assert 'UPDATE CARGO' in args
    assert 'nome = :nome' in args
    assert 'descricao = :descricao' in args
    assert 'cod_cargo = :cod_cargo' in args
    assert {
        'nome': 'Director',
        'descricao': 'Manages things',
        'cod_cargo': 1,
    } == sttm

    # Test Delete
    obj.delete()
    args, _ = mock_db.write_raw_query.call_args
    args, sttm = str(args[0]), args[1]
    assert 'DELETE FROM CARGO' in args
    assert 'cod_cargo = :cod_cargo' in args
    assert {'cod_cargo': 1} == sttm
    assert not obj._in_db


def test_unknown_object_type(mock_db):
    with pytest.raises(ValueError, match='Unknown object type: unknown'):
        FactoryObjectDB().create_instance('unknown', {}, mock_db)

from src.db.models import (
    AvaliacaoDB,
    CargoDB,
    EmailDB,
    FactoryAvaliacaoDB,
    FactoryCargoDB,
    FactoryEmailDB,
    FactoryFuncionarioDB,
    FactoryLocalDB,
    FactoryMoradorDB,
    FactoryOcorrenciaDB,
    FactoryOrgaoPublicoDB,
    FactoryServicoDB,
    FactoryTelefoneDB,
    FactoryTipoOcorrenciaDB,
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
        'cod_aval': 1,
        'cod_servico': 2,
        'cod_morador': 3,
        'nota_serv': 5,
        'nota_tempo': 4,
        'opiniao': 'Good',
    }
    obj: AvaliacaoDB = FactoryAvaliacaoDB(mock_db, data)
    assert isinstance(obj, AvaliacaoDB)
    assert obj.table_name == 'AVALIACAO'
    assert obj.cod_aval == 1
    assert obj.nota_serv == data['nota_serv']


def test_cargo_factory_and_model(mock_db):
    data = {
        'cod_cargo': 1,
        'nome': 'Manager',
        'descricao': 'Manages things',
    }
    obj = FactoryCargoDB(mock_db, data)
    assert isinstance(obj, CargoDB)
    assert obj.table_name == 'CARGO'
    assert obj.cod_cargo == 1
    assert obj.nome == 'Manager'


def test_email_factory_and_model(mock_db):
    data = {
        'cod_email': 1,
        'cod_func': 2,
        'cod_morador': None,
        'email': 'test@example.com',
    }
    obj = FactoryEmailDB(mock_db, data)
    assert isinstance(obj, EmailDB)
    assert obj.table_name == 'EMAIL'
    assert obj.cod_email == 1
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
    obj = FactoryFuncionarioDB(mock_db, data)
    assert isinstance(obj, FuncionarioDB)
    assert obj.table_name == 'FUNCIONARIO'
    assert obj.cod_func == 1
    assert obj.cpf == '12345678901'


def test_local_factory_and_model(mock_db):
    data = {
        'cod_local': 1,
        'estado': 'DF',
        'municipio': 'Brasilia',
        'bairro': 'Asa Norte',
        'endereco': 'SQN 102',
    }
    obj = FactoryLocalDB(mock_db, data)
    assert isinstance(obj, LocalDB)
    assert obj.table_name == 'LOCALIDADE'
    assert obj.cod_local == 1
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
    obj = FactoryOcorrenciaDB(mock_db, data)
    assert isinstance(obj, OcorrenciaDB)
    assert obj.table_name == 'OCORRENCIA'
    assert obj.cod_oco == 1
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
    obj = FactoryOrgaoPublicoDB(mock_db, data)
    assert isinstance(obj, OrgaoPublicoDB)
    assert obj.table_name == 'ORGAO_PUBLICO'
    assert obj.cod_orgao == 1
    assert obj.nome == 'Orgao 1'


def test_morador_factory_and_model(mock_db):
    data = {
        'cod_morador': 1,
        'endereco': 2,
        'cpf': '00000000000',
        'data_nasc': '2000-01-01',
    }
    obj = FactoryMoradorDB(mock_db, data)
    assert isinstance(obj, MoradorDB)
    assert obj.table_name == 'MORADOR'
    assert obj.cod_morador == 1
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
    obj = FactoryServicoDB(mock_db, data)
    assert isinstance(obj, ServicoDB)
    assert obj.table_name == 'SERVICO'
    assert obj.cod_servico == 1
    assert obj.nome == 'Servico 1'


def test_telefone_factory_and_model(mock_db):
    data = {'telefone': '99999999', 'cod_morador': 1, 'DDD': '61'}
    obj = FactoryTelefoneDB(mock_db, data)
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
    obj = FactoryTipoOcorrenciaDB(mock_db, data)
    assert isinstance(obj, TipoOcorrenciaDB)
    assert obj.table_name == 'TIPO_OCORRENCIA'
    assert obj.cod_tipo == 1
    assert obj.nome == 'Tipo 1'


def test_objetodb_sql_generation(mock_db):
    data = {'cod_cargo': 1, 'nome': 'Manager', 'descricao': 'Manages things'}
    obj = CargoDB(mock_db, data, False)
    assert not obj._in_db

    # Test Insert
    obj.update()
    mock_db.execute_raw_query.assert_called()
    args, _ = mock_db.execute_raw_query.call_args
    assert 'INSERT INTO CARGO' in args[0]
    assert 'nome' in args[0]
    assert 'descricao' in args[0]
    assert {'nome': 'Manager', 'descricao': 'Manages things'} == args[1]
    assert obj._in_db

    # Test Update
    obj.nome = 'Director'
    obj.update()
    args, _ = mock_db.execute_raw_query.call_args
    assert 'UPDATE CARGO' in args[0]
    assert 'nome = ?' in args[0]
    assert 'descricao = ?' in args[0]
    assert 'cod_cargo = ?' in args[0]
    assert {
        'nome': 'Director',
        'descricao': 'Manages things',
        'cod_cargo': 1,
    } == args[1]

    # Test Delete
    obj.delete()
    args, _ = mock_db.execute_raw_query.call_args
    assert 'DELETE FROM CARGO' in args[0]
    assert 'cod_cargo = ?' in args[0]
    assert {'cod_cargo': 1} == args[1]
    assert not obj._in_db

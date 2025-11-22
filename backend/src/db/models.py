from typing import Any, ClassVar

from sqlalchemy import text

from src.interfaces.interfaces import DatabaseInterface, ObjectDBInterface


class ObjetoDB(ObjectDBInterface):
    name: ClassVar[str] = 'ObjetoDB'

    def __init__(self, db: DatabaseInterface, in_db: bool = False) -> None:
        self._db = db

        self._in_db = in_db

    @property
    def table_name(self) -> str:
        return getattr(self, 'name', self.__class__.__name__)

    def update(self) -> None:
        if self._in_db:
            self._update_in_db()
        else:
            self._insert_in_db()
            self._in_db = True

    def _update_in_db(self) -> None:
        params, conditions = self._get_values()

        sql_update = (
            f'UPDATE {self.table_name} SET '
            + ', '.join(f'{k} = :{k}' for k in params.keys())
            + ' WHERE '
            + ' AND '.join(f'{k} = :{k}' for k in conditions.keys())
        )

        self._db.write_raw_query(sql_update, conditions | params)
        self._db.commit()

    def _insert_in_db(self) -> None:
        params, conditions = self._get_values()

        sql_insert = (
            f'INSERT INTO {self.table_name} ( '
            + ', '.join(params.keys())
            + ' ) VALUES ( '
            + ', '.join(f':{k}' for k in params.keys())
            + ' )'
        )

        result = self._db.connection.execute(text(sql_insert), params)

        last_id = result.lastrowid

        pk_field = self.PK_FIELDS[0]
        setattr(self, pk_field, last_id)

        self._in_db = True

    def delete(self) -> None:
        _, conditions = self._get_values()

        sql_delete = (
            f'DELETE FROM {self.table_name} '
            + 'WHERE '
            + ' AND '.join(f'{k} = :{k}' for k in conditions.keys())
        )

        self._db.write_raw_query(sql_delete, conditions)
        self._db.commit()
        self._in_db = False
        setattr(self, self.PK_FIELDS[0], None)

    def _get_values(self) -> tuple[dict[str, Any], dict[str, Any]]:
        params = {}
        conditions = {}

        pk_fields = getattr(self, 'PK_FIELDS', [])
        non_pk_fields = getattr(self, 'NON_PK_FIELDS', [])

        for key in non_pk_fields:
            params[key] = getattr(self, key)

        for key in pk_fields:
            conditions[key] = getattr(self, key)

        return params, conditions


class AvaliacaoDB(ObjetoDB):
    name: str = 'AVALIACAO'

    PK_FIELDS = ['cod_aval']
    NON_PK_FIELDS = [
        'cod_servico',
        'cod_morador',
        'nota_serv',
        'nota_tempo',
        'opiniao',
    ]

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_aval = data['cod_aval']
        else:
            self.cod_aval = None
        self.cod_servico = data['cod_servico']
        self.cod_morador = data['cod_morador']
        self.nota_serv = data['nota_serv']
        self.nota_tempo = data['nota_tempo']
        self.opiniao = data['opiniao']


class CargoDB(ObjetoDB):
    name: str = 'CARGO'

    PK_FIELDS = ['cod_cargo']
    NON_PK_FIELDS = ['nome', 'descricao']

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_cargo = data['cod_cargo']
        else:
            self.cod_cargo = None
        self.nome = data['nome']
        self.descricao = data['descricao']


class EmailDB(ObjetoDB):
    name: str = 'EMAIL'

    PK_FIELDS = ['cod_email']
    NON_PK_FIELDS = ['cod_func', 'cod_morador', 'email']

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_email = data['cod_email']
        else:
            self.cod_email = None
        self.cod_func = data['cod_func']
        self.cod_morador = data['cod_morador']
        self.email = data['email']


class FuncionarioDB(ObjetoDB):
    name: str = 'FUNCIONARIO'

    PK_FIELDS = ['cod_func']
    NON_PK_FIELDS = [
        'orgao_pub',
        'cargo',
        'cpf',
        'data_nasc',
        'inicio_contrato',
        'fim_contrato',
    ]

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_func = data['cod_func']
        else:
            self.cod_func = None
        self.orgao_pub = data['orgao_pub']
        self.cargo = data['cargo']
        self.cpf = data['cpf']
        self.data_nasc = data['data_nasc']
        self.inicio_contrato = data['inicio_contrato']
        self.fim_contrato = data['fim_contrato']


class LocalDB(ObjetoDB):
    name: str = 'LOCALIDADE'

    PK_FIELDS = ['cod_local']
    NON_PK_FIELDS = ['estado', 'municipio', 'bairro', 'endereco']

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_local = data['cod_local']
        else:
            self.cod_local = None
        self.estado = data['estado']
        self.municipio = data['municipio']
        self.bairro = data['bairro']
        self.endereco = data['endereco']


class OcorrenciaDB(ObjetoDB):
    name: str = 'OCORRENCIA'

    PK_FIELDS = ['cod_oco']
    NON_PK_FIELDS = ['cod_tipo', 'cod_local', 'cod_morador', 'data', 'status']

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_oco = data['cod_oco']
        else:
            self.cod_oco = None
        self.cod_tipo = data['cod_tipo']
        self.cod_local = data['cod_local']
        self.cod_morador = data['cod_morador']
        self.data = data['data']
        self.status = data['status']


class OrgaoPublicoDB(ObjetoDB):
    name: str = 'ORGAO_PUBLICO'

    PK_FIELDS = ['cod_orgao']
    NON_PK_FIELDS = ['nome', 'estado', 'descr', 'data_ini', 'data_fim']

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_orgao = data['cod_orgao']
        else:
            self.cod_orgao = None
        self.nome = data['nome']
        self.estado = data['estado']
        self.descr = data['descr']
        self.data_ini = data['data_ini']
        self.data_fim = data['data_fim']


class MoradorDB(ObjetoDB):
    name: str = 'MORADOR'

    PK_FIELDS = ['cod_morador']
    NON_PK_FIELDS = ['endereco', 'cpf', 'data_nasc']

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_morador = data['cod_morador']
        else:
            self.cod_morador = None
        self.endereco = data['endereco']
        self.cpf = data['cpf']
        self.data_nasc = data['data_nasc']


class ServicoDB(ObjetoDB):
    name: str = 'SERVICO'

    PK_FIELDS = ['cod_servico']
    NON_PK_FIELDS = [
        'cod_orgao',
        'cod_local',
        'nome',
        'descr',
        'inicio_servico',
        'fim_servico',
    ]

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_servico = data['cod_servico']
        else:
            self.cod_servico = None
        self.cod_orgao = data['cod_orgao']
        self.cod_local = data['cod_local']
        self.nome = data['nome']
        self.descr = data['descr']
        self.inicio_servico = data['inicio_servico']
        self.fim_servico = data['fim_servico']


class TelefoneDB(ObjetoDB):
    name: str = 'TELEFONE'

    PK_FIELDS = ['telefone']
    NON_PK_FIELDS = ['cod_morador', 'DDD']

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        self.telefone = data['telefone']
        self.cod_morador = data['cod_morador']
        self.DDD = data['DDD']


class TipoOcorrenciaDB(ObjetoDB):
    name: str = 'TIPO_OCORRENCIA'

    PK_FIELDS = ['cod_tipo']
    NON_PK_FIELDS = ['orgao_pub', 'nome', 'descr']

    def __init__(
        self,
        db: DatabaseInterface,
        data: dict[str, Any],
        in_db: bool = False,
    ) -> None:
        super().__init__(db, in_db)
        if in_db:
            self.cod_tipo = data['cod_tipo']
        else:
            self.cod_tipo = None
        self.orgao_pub = data['orgao_pub']
        self.nome = data['nome']
        self.descr = data['descr']

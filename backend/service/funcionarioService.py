import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()

_FUNCIONARIO_BASE_QUERY = (
	"SELECT \n"
	"\tf.cpf,\n"
	"\tf.nome,\n"
	"\tf.orgao_pub,\n"
	"\torg.nome AS orgao_nome,\n"
	"\tf.cargo,\n"
	"\tcg.nome AS cargo_nome,\n"
	"\tf.data_nasc,\n"
	"\tf.inicio_contrato,\n"
	"\tf.fim_contrato,\n"
	"\tft.imagem AS foto,\n"
	"\tem.email\n"
	"FROM FUNCIONARIO AS f\n"
	"LEFT JOIN ORGAO_PUBLICO AS org ON org.cod_orgao = f.orgao_pub\n"
	"LEFT JOIN CARGO AS cg ON cg.cod_cargo = f.cargo\n"
	"LEFT JOIN FOTO AS ft ON ft.cpf_func = f.cpf\n"
	"LEFT JOIN EMAIL AS em ON em.cpf_func = f.cpf"
)


class FuncionarioService:
	
	def __init__(self, db_manager: "DatabaseManager") -> None:
		self._db_manager = db_manager


	def list_funcionarios(self) -> Sequence[dict[str, Any]]:
		sql = f"{_FUNCIONARIO_BASE_QUERY}\nORDER BY f.nome"
		return self._db_manager.execute_raw_query(sql)


	def get_funcionario_by_cpf(self, cpf: str) -> Optional[dict[str, Any]]:
		sql = f"{_FUNCIONARIO_BASE_QUERY}\nWHERE f.cpf = :cpf"
		result = self._db_manager.execute_raw_query(sql, {"cpf": cpf})
		return result[0] if result else None


	def get_funcionario_by_email(self, email: str) -> Optional[dict[str, Any]]:
		sql = f"{_FUNCIONARIO_BASE_QUERY}\nWHERE em.email = :email"
		result = self._db_manager.execute_raw_query(sql, {"email": email})
		return result[0] if result else None


	def authenticate(self, email: str, senha: str) -> Optional[dict[str, Any]]:
		sql = (
			"SELECT "
			"\tf.cpf, "
			"\tf.nome, "
			"\tf.senha, "
			"\tf.orgao_pub, "
			"\tf.cargo "
			"FROM FUNCIONARIO AS f "
			"JOIN EMAIL AS em ON em.cpf_func = f.cpf "
			"WHERE em.email = :email"
		)
		result = self._db_manager.execute_raw_query(sql, {"email": email})
		if not result:
			return None

		record = result[0]
		if record.get("senha") != senha:
			return None

		return {
			"cpf": record["cpf"],
			"nome": record["nome"],
			"email": email,
			"orgao_pub": record["orgao_pub"],
			"cargo": record["cargo"],
		}


	def create_funcionario(
		self,
		cpf: str,
		nome: str,
		orgao_pub: int,
		cargo: int,
		data_nasc: str,
		inicio_contrato: str,
		senha: str,
		foto: Optional[bytes],
		email: Optional[str],
		fim_contrato: Optional[str] = None,
	) -> dict[str, Any]:

		return self._create_funcionario_record(
			payload={
				"cpf": cpf,
				"nome": nome,
				"orgao_pub": orgao_pub,
				"cargo": cargo,
				"data_nasc": data_nasc,
				"inicio_contrato": inicio_contrato,
				"fim_contrato": fim_contrato,
				"senha": senha,
			},
			foto=foto,
			email=email,
		)


	def update_funcionario(
		self,
		cpf: str,
		nome: Any = _UNSET,
		orgao_pub: Any = _UNSET,
		cargo: Any = _UNSET,
		data_nasc: Any = _UNSET,
		inicio_contrato: Any = _UNSET,
		fim_contrato: Any = _UNSET,
		senha: Any = _UNSET,
		email: Any = _UNSET,
		foto: Any = _UNSET,
	) -> Optional[dict[str, Any]]:

		fields_to_update: Dict[str, Any] = {}
		if nome is not _UNSET:
			fields_to_update["nome"] = nome
		if orgao_pub is not _UNSET:
			fields_to_update["orgao_pub"] = orgao_pub
		if cargo is not _UNSET:
			fields_to_update["cargo"] = cargo
		if data_nasc is not _UNSET:
			fields_to_update["data_nasc"] = data_nasc
		if inicio_contrato is not _UNSET:
			fields_to_update["inicio_contrato"] = inicio_contrato
		if fim_contrato is not _UNSET:
			fields_to_update["fim_contrato"] = fim_contrato
		if senha is not _UNSET:
			fields_to_update["senha"] = senha

		try:
			with self._db_manager.engine.begin() as connection:
				if fields_to_update:
					set_clause = ", ".join(
						f"{column} = :{column}" for column in fields_to_update.keys()
					)
					params = {**fields_to_update, "cpf": cpf}
					connection.execute(
						text(f"UPDATE FUNCIONARIO SET {set_clause} WHERE cpf = :cpf"),
						params,
					)

				self._sync_email(connection, cpf, email)
				self._sync_foto(connection, cpf, foto)
		except SQLAlchemyError:
			logger.exception("Erro ao atualizar funcionario %s", cpf)
			raise

		return self.get_funcionario_by_cpf(cpf)


	def delete_funcionario(self, cpf: str) -> None:
		sql = "DELETE FROM FUNCIONARIO WHERE cpf = :cpf"
		self._db_manager.execute_raw_query(sql, {"cpf": cpf})


	def _create_funcionario_record(
		self,
		payload: Dict[str, Any],
		foto: Optional[bytes],
		email: Optional[str],
	) -> dict[str, Any]:
		insert_sql = (
			"INSERT INTO FUNCIONARIO (cpf, nome, orgao_pub, cargo, data_nasc, inicio_contrato, fim_contrato, senha) "
			"VALUES (:cpf, :nome, :orgao_pub, :cargo, :data_nasc, :inicio_contrato, :fim_contrato, :senha)"
		)

		try:
			with self._db_manager.engine.begin() as connection:
				connection.execute(text(insert_sql), payload)
				cpf = payload["cpf"]

				if email:
					connection.execute(
						text(
							"INSERT INTO EMAIL (cpf_func, email) VALUES (:cpf, :email)"
						),
						{"cpf": cpf, "email": email},
					)

				if foto is not None:
					connection.execute(
						text(
							"INSERT INTO FOTO (cpf_func, imagem) VALUES (:cpf, :foto)"
						),
						{"cpf": cpf, "foto": foto},
					)
		except SQLAlchemyError:
			logger.exception("Erro ao criar funcionario")
			raise

		created = self.get_funcionario_by_cpf(cpf)
		if created is None:
			raise RuntimeError("Funcionario recem criado nao encontrado")
		return created


	def _sync_email(self, connection: Connection, cpf: str, email: Any) -> None:
		if email is _UNSET:
			return

		connection.execute(
			text("DELETE FROM EMAIL WHERE cpf_func = :cpf"),
			{"cpf": cpf},
		)

		if email:
			connection.execute(
				text("INSERT INTO EMAIL (cpf_func, email) VALUES (:cpf, :email)"),
				{"cpf": cpf, "email": email},
			)


	def _sync_foto(self, connection: Connection, cpf: str, foto: Any) -> None:
		if foto is _UNSET:
			return

		connection.execute(
			text("DELETE FROM FOTO WHERE cpf_func = :cpf"),
			{"cpf": cpf},
		)

		if foto is not None:
			connection.execute(
				text("INSERT INTO FOTO (cpf_func, imagem) VALUES (:cpf, :foto)"),
				{"cpf": cpf, "foto": foto},
			)

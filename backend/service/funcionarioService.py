import logging
from typing import Any, Dict, Optional, Sequence

from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import SQLAlchemyError

from ..persistence.databaseManager import DatabaseManager

logger = logging.getLogger(__name__)

_UNSET = object()


class FuncionarioService:
	
	def __init__(self, db_manager: "DatabaseManager") -> None:
		self._db_manager = db_manager


	def list_funcionarios(self) -> Sequence[dict[str, Any]]:
		sql = (
			"SELECT cpf, orgao_pub, cargo, data_nasc, "
			"inicio_contrato, fim_contrato "
			"FROM FUNCIONARIO"
		)
		return self._db_manager.execute_raw_query(sql)


	def get_funcionario_by_cpf(self, cpf: str) -> Optional[dict[str, Any]]:
		sql = (
			"SELECT f.cpf, f.orgao_pub, f.cargo, f.data_nasc, "
			"f.inicio_contrato, f.fim_contrato, ft.imagem AS foto, em.email "
			"FROM FUNCIONARIO AS f "
			"LEFT JOIN FOTO AS ft ON ft.cpf_func = f.cpf "
			"LEFT JOIN EMAIL AS em ON em.cpf_func = f.cpf "
			"WHERE f.cpf = :cpf"
		)
		result = self._db_manager.execute_raw_query(sql, {"cpf": cpf})
		return result[0] if result else None


	def get_funcionario_by_email(self, email: str) -> Optional[dict[str, Any]]:
		sql = (
			"SELECT f.cpf, f.orgao_pub, f.cargo, f.data_nasc, "
			"f.inicio_contrato, f.fim_contrato, ft.imagem AS foto, em.email "
			"FROM EMAIL AS em "
			"INNER JOIN FUNCIONARIO AS f ON f.cpf = em.cpf_func "
			"LEFT JOIN FOTO AS ft ON ft.cpf_func = f.cpf "
			"WHERE em.email = :email"
		)
		result = self._db_manager.execute_raw_query(sql, {"email": email})
		return result[0] if result else None


	def create_funcionario(
		self,
		cpf: str,
		orgao_pub: int,
		cargo: int,
		data_nasc: str,
		inicio_contrato: str,
		foto: Optional[bytes],
		email: Optional[str],
		fim_contrato: Optional[str] = None,
	) -> dict[str, Any]:

		return self._create_funcionario_record(
			payload={
				"cpf": cpf,
				"orgao_pub": orgao_pub,
				"cargo": cargo,
				"data_nasc": data_nasc,
				"inicio_contrato": inicio_contrato,
				"fim_contrato": fim_contrato,
			},
			foto=foto,
			email=email,
		)


	def update_funcionario(
		self,
		cpf: str,
		orgao_pub: Any = _UNSET,
		cargo: Any = _UNSET,
		data_nasc: Any = _UNSET,
		inicio_contrato: Any = _UNSET,
		fim_contrato: Any = _UNSET,
		email: Any = _UNSET,
		foto: Any = _UNSET,
	) -> Optional[dict[str, Any]]:

		fields_to_update: Dict[str, Any] = {}
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
			"INSERT INTO FUNCIONARIO (orgao_pub, cargo, cpf, data_nasc, inicio_contrato, fim_contrato) "
			"VALUES (:orgao_pub, :cargo, :cpf, :data_nasc, :inicio_contrato, :fim_contrato)"
		)

		try:
			with self._db_manager.engine.begin() as connection:
				connection.execute(text(insert_sql), payload)
				cpf = payload["cpf"]

				if email:
					connection.execute(
						text(
							"INSERT INTO EMAIL (cpf, email) VALUES (:cpf, :email)"
						),
						{"cpf": cpf, "email": email},
					)

				if foto is not None:
					connection.execute(
						text(
							"INSERT INTO FOTO (cpf, imagem) VALUES (:cpf, :foto)"
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
			text("DELETE FROM EMAIL WHERE cpf = :cpf"),
			{"cpf": cpf},
		)

		if email:
			connection.execute(
				text("INSERT INTO EMAIL (cpf, email) VALUES (:cpf, :email)"),
				{"cpf": cpf, "email": email},
			)


	def _sync_foto(self, connection: Connection, cpf: str, foto: Any) -> None:
		if foto is _UNSET:
			return

		connection.execute(
			text("DELETE FROM FOTO WHERE cpf = :cpf"),
			{"cpf": cpf},
		)

		if foto is not None:
			connection.execute(
				text("INSERT INTO FOTO (cpf, imagem) VALUES (:cpf, :foto)"),
				{"cpf": cpf, "foto": foto},
			)

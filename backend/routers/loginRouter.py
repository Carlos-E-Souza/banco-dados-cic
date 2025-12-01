from typing import Dict, Optional, Tuple

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from ..service.funcionarioService import FuncionarioService
from ..service.moradorService import MoradorService

router = APIRouter(prefix="/auth", tags=["auth"])

_morador_service: Optional[MoradorService] = None
_funcionario_service: Optional[FuncionarioService] = None


def set_login_services(
	morador_service: MoradorService,
	funcionario_service: FuncionarioService,
) -> None:
	global _morador_service, _funcionario_service
	_morador_service = morador_service
	_funcionario_service = funcionario_service


def _get_services() -> Tuple[MoradorService, FuncionarioService]:
	if _morador_service is None or _funcionario_service is None:
		raise HTTPException(
			status_code=500,
			detail="Servicos de login nao inicializados",
		)
	return _morador_service, _funcionario_service


class LoginPayload(BaseModel):
	email: EmailStr = Field(..., description="Email cadastrado para o usuario")
	senha: str = Field(..., min_length=1, description="Senha correspondente")


@router.post("/login")
def login(payload: LoginPayload) -> Dict[str, object]:
	morador_service, funcionario_service = _get_services()
	email = payload.email.strip()
	senha = payload.senha

	funcionario = funcionario_service.authenticate(email, senha)
	if funcionario:
		response: Dict[str, object] = {
			"tipo": "funcionario",
			"isFuncionario": True,
			"cpf": funcionario["cpf"],
			"nome": funcionario["nome"],
			"email": funcionario["email"],
		}
		orgao_pub = funcionario.get("orgao_pub")
		if orgao_pub is not None:
			response["orgao_pub"] = orgao_pub
		cargo = funcionario.get("cargo")
		if cargo is not None:
			response["cargo"] = cargo
		return response

	morador = morador_service.authenticate(email, senha)
	if morador:
		return {
			"tipo": "morador",
			"isFuncionario": False,
			"cpf": morador["cpf"],
			"nome": morador["nome"],
			"email": morador["email"],
		}

	raise HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Credenciais invalidas",
	)

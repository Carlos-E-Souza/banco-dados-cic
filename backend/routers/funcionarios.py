import base64
import binascii
from datetime import date
from typing import Any, Dict, Optional, Sequence

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, EmailStr

from ..service.funcionarioService import FuncionarioService

router = APIRouter(prefix="/func")

_service: Optional[FuncionarioService] = None


def set_funcionario_service(service: FuncionarioService) -> None:
    global _service
    _service = service


def _get_funcionario_service() -> FuncionarioService:
    if _service is None:
        raise HTTPException(status_code=500, detail="Servico de funcionario nao inicializado")
    return _service


class FuncionarioCreate(BaseModel):
    cpf: str
    orgao_pub: int
    cargo: int
    data_nasc: date
    inicio_contrato: date
    fim_contrato: Optional[date] = None
    email: Optional[EmailStr] = None
    foto: Optional[str] = None


class FuncionarioUpdate(BaseModel):
    orgao_pub: Optional[int] = None
    cargo: Optional[int] = None
    data_nasc: Optional[date] = None
    inicio_contrato: Optional[date] = None
    fim_contrato: Optional[date] = None
    email: Optional[EmailStr] = None
    foto: Optional[str] = None


def _date_to_iso(value: Optional[date]) -> Optional[str]:
    return value.isoformat() if value else None


def _decode_foto(encoded: Optional[str]) -> Optional[bytes]:
    if encoded is None:
        return None

    try:
        return base64.b64decode(encoded)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Foto deve estar em base64 valido") from exc


def _serialize_funcionario(record: Dict[str, Any]) -> Dict[str, Any]:
    serialized = dict(record)
    foto = serialized.get("foto")
    if isinstance(foto, (bytes, bytearray)):
        serialized["foto"] = base64.b64encode(foto).decode("ascii")
    return serialized


@router.get("/")
def listar_funcionarios() -> Sequence[Dict[str, Any]]:
    service = _get_funcionario_service()
    return service.list_funcionarios()


@router.get("/cpf/{cpf}")
def obter_funcionario_por_cpf(cpf: str) -> Dict[str, Any]:
    service = _get_funcionario_service()
    funcionario = service.get_funcionario_by_cpf(cpf)
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionario nao encontrado")
    return _serialize_funcionario(funcionario)


@router.get("/email/{email}")
def obter_funcionario_por_email(email: str) -> Dict[str, Any]:
    service = _get_funcionario_service()
    funcionario = service.get_funcionario_by_email(email)
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionario nao encontrado")
    return _serialize_funcionario(funcionario)


@router.post("/")
def criar_funcionario(payload: FuncionarioCreate) -> Dict[str, Any]:
    service = _get_funcionario_service()
    created = service.create_funcionario(
        cpf=payload.cpf,
        orgao_pub=payload.orgao_pub,
        cargo=payload.cargo,
        data_nasc=payload.data_nasc.isoformat(),
        inicio_contrato=payload.inicio_contrato.isoformat(),
        fim_contrato=_date_to_iso(payload.fim_contrato),
        foto=_decode_foto(payload.foto),
        email=payload.email,
    )
    return _serialize_funcionario(created)


@router.put("/{cpf}")
def atualizar_funcionario(cpf: str, payload: FuncionarioUpdate) -> Dict[str, Any]:
    service = _get_funcionario_service()
    update_fields: Dict[str, Any] = payload.model_dump(exclude_unset=True)

    if "data_nasc" in update_fields:
        update_fields["data_nasc"] = update_fields["data_nasc"].isoformat()
    if "inicio_contrato" in update_fields:
        update_fields["inicio_contrato"] = update_fields["inicio_contrato"].isoformat()
    if "fim_contrato" in update_fields:
        update_fields["fim_contrato"] = _date_to_iso(update_fields["fim_contrato"])
    if "foto" in update_fields:
        update_fields["foto"] = (
            _decode_foto(update_fields["foto"])
            if update_fields["foto"] is not None
            else None
        )

    updated = service.update_funcionario(cpf, **update_fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Funcionario nao encontrado")
    return _serialize_funcionario(updated)


@router.delete("/{cpf}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_funcionario(cpf: str) -> Response:
    service = _get_funcionario_service()
    funcionario = service.get_funcionario_by_cpf(cpf)
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionario nao encontrado")

    service.delete_funcionario(cpf)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
    
from datetime import date
from typing import Any, Dict, Optional, Sequence

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field

from ..service.moradorService import MoradorService

router = APIRouter(prefix="/moradores")

_service: Optional[MoradorService] = None


def set_morador_service(service: MoradorService) -> None:
    global _service
    _service = service


def _get_morador_service() -> MoradorService:
    if _service is None:
        raise HTTPException(status_code=500, detail="Servico de morador nao inicializado")
    return _service


class LocalidadePayload(BaseModel):
    estado: str = Field(..., min_length=1)
    cidade: str = Field(..., min_length=1)
    bairro: str = Field(..., min_length=1)


class MoradorCreate(BaseModel):
    cpf: str
    nome: str
    endereco: str
    data_nasc: date
    senha: str
    cod_local: Optional[int] = None
    localidade: Optional[LocalidadePayload] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    ddd: Optional[str] = None


class MoradorUpdate(BaseModel):
    nome: Optional[str] = None
    endereco: Optional[str] = None
    data_nasc: Optional[date] = None
    senha: Optional[str] = None
    cod_local: Optional[int] = None
    localidade: Optional[LocalidadePayload] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    ddd: Optional[str] = None


@router.get("/")
def listar_moradores() -> Sequence[Dict[str, Any]]:
    service = _get_morador_service()
    return service.list_moradores()


@router.get("/cpf/{cpf}")
def obter_morador_por_cpf(cpf: str) -> Dict[str, Any]:
    service = _get_morador_service()
    morador = service.get_morador_by_cpf(cpf)
    if not morador:
        raise HTTPException(status_code=404, detail="Morador nao encontrado")
    return morador


@router.post("/")
def criar_morador(payload: MoradorCreate) -> Dict[str, Any]:
    service = _get_morador_service()

    if payload.cod_local is None and payload.localidade is None:
        raise HTTPException(status_code=400, detail="Informe cod_local ou dados de localidade")

    try:
        created = service.create_morador(
            cpf=payload.cpf,
            nome=payload.nome,
            endereco=payload.endereco,
            data_nasc=payload.data_nasc.isoformat(),
            senha=payload.senha,
            cod_local=payload.cod_local,
            localidade=payload.localidade.model_dump() if payload.localidade else None,
            email=payload.email,
            telefone=payload.telefone,
            ddd=payload.ddd,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return created


@router.put("/{cpf}")
def atualizar_morador(cpf: str, payload: MoradorUpdate) -> Dict[str, Any]:
    service = _get_morador_service()

    update_fields: Dict[str, Any] = payload.model_dump(exclude_unset=True)
    if "data_nasc" in update_fields and update_fields["data_nasc"] is not None:
        update_fields["data_nasc"] = update_fields["data_nasc"].isoformat()
    if "localidade" in update_fields and update_fields["localidade"] is not None:
        localidade = update_fields["localidade"]
        if isinstance(localidade, BaseModel):
            update_fields["localidade"] = localidade.model_dump()

    try:
        updated = service.update_morador(cpf, **update_fields)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not updated:
        raise HTTPException(status_code=404, detail="Morador nao encontrado")
    return updated


@router.delete("/{cpf}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_morador(cpf: str) -> Response:
    service = _get_morador_service()
    morador = service.get_morador_by_cpf(cpf)
    if not morador:
        raise HTTPException(status_code=404, detail="Morador nao encontrado")

    service.delete_morador(cpf)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

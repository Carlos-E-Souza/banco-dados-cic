from typing import Any, Dict, Optional, Sequence

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, Field

from ..service.cargoService import CargoService

router = APIRouter(prefix="/cargos")

_service: Optional[CargoService] = None


def set_cargo_service(service: CargoService) -> None:
    global _service
    _service = service


def _get_cargo_service() -> CargoService:
    if _service is None:
        raise HTTPException(status_code=500, detail="Servico de cargo nao inicializado")
    return _service


class CargoCreate(BaseModel):
    nome: str = Field(..., min_length=1)
    descricao: Optional[str] = None


class CargoUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1)
    descricao: Optional[str] = None


@router.get("/")
def listar_cargos() -> Sequence[Dict[str, Any]]:
    service = _get_cargo_service()
    return service.list_cargos()


@router.get("/{cod_cargo}")
def obter_cargo(cod_cargo: int) -> Dict[str, Any]:
    service = _get_cargo_service()
    cargo = service.get_cargo_by_id(cod_cargo)
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo nao encontrado")
    return cargo


@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_cargo(payload: CargoCreate) -> Dict[str, Any]:
    service = _get_cargo_service()
    return service.create_cargo(nome=payload.nome, descricao=payload.descricao)


@router.put("/{cod_cargo}")
def atualizar_cargo(cod_cargo: int, payload: CargoUpdate) -> Dict[str, Any]:
    service = _get_cargo_service()
    update_fields: Dict[str, Any] = payload.model_dump(exclude_unset=True)

    updated = service.update_cargo(cod_cargo, **update_fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Cargo nao encontrado")
    return updated


@router.delete("/{cod_cargo}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_cargo(cod_cargo: int) -> Response:
    service = _get_cargo_service()
    cargo = service.get_cargo_by_id(cod_cargo)
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo nao encontrado")

    service.delete_cargo(cod_cargo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

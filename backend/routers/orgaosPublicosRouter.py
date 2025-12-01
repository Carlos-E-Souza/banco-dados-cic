from datetime import date
from typing import Any, Dict, Optional, Sequence

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, Field

from ..service.orgaoPublicoService import OrgaoPublicoService

router = APIRouter(prefix="/orgaos-publicos")

_service: Optional[OrgaoPublicoService] = None


def set_orgao_publico_service(service: OrgaoPublicoService) -> None:
    global _service
    _service = service


def _get_service() -> OrgaoPublicoService:
    if _service is None:
        raise HTTPException(status_code=500, detail="Servico de orgao publico nao inicializado")
    return _service


class OrgaoPublicoCreate(BaseModel):
    nome: str
    estado: str = Field(..., min_length=1, max_length=18)
    data_ini: date
    data_fim: Optional[date] = None
    descr: Optional[str] = None


class OrgaoPublicoUpdate(BaseModel):
    nome: Optional[str] = None
    estado: Optional[str] = Field(default=None, min_length=1, max_length=18)
    data_ini: Optional[date] = None
    data_fim: Optional[date] = None
    descr: Optional[str] = None


def _date_to_iso(value: Optional[date]) -> Optional[str]:
    return value.isoformat() if value else None


@router.get("/")
def listar_orgaos_publicos() -> Sequence[Dict[str, Any]]:
    service = _get_service()
    return service.list_orgaos_publicos()


@router.get("/{cod_orgao}")
def obter_orgao_publico(cod_orgao: int) -> Dict[str, Any]:
    service = _get_service()
    orgao = service.get_orgao_by_id(cod_orgao)
    if not orgao:
        raise HTTPException(status_code=404, detail="Orgao publico nao encontrado")
    return orgao


@router.post("/")
def criar_orgao_publico(payload: OrgaoPublicoCreate) -> Dict[str, Any]:
    service = _get_service()
    created = service.create_orgao_publico(
        nome=payload.nome,
        estado=payload.estado,
        descr=payload.descr,
        data_ini=payload.data_ini.isoformat(),
        data_fim=_date_to_iso(payload.data_fim),
    )
    return created


@router.put("/{cod_orgao}")
def atualizar_orgao_publico(cod_orgao: int, payload: OrgaoPublicoUpdate) -> Dict[str, Any]:
    service = _get_service()
    update_fields: Dict[str, Any] = payload.model_dump(exclude_unset=True)

    if "data_ini" in update_fields and update_fields["data_ini"] is not None:
        update_fields["data_ini"] = update_fields["data_ini"].isoformat()
    if "data_fim" in update_fields and update_fields["data_fim"] is not None:
        update_fields["data_fim"] = update_fields["data_fim"].isoformat()

    updated = service.update_orgao_publico(cod_orgao, **update_fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Orgao publico nao encontrado")
    return updated


@router.delete("/{cod_orgao}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_orgao_publico(cod_orgao: int) -> Response:
    service = _get_service()
    orgao = service.get_orgao_by_id(cod_orgao)
    if not orgao:
        raise HTTPException(status_code=404, detail="Orgao publico nao encontrado")

    service.delete_orgao_publico(cod_orgao)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

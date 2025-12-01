from datetime import date
from typing import Any, Dict, Optional, Sequence

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel

from ..service.servicoService import ServicoService

router = APIRouter(prefix="/servicos")

_service: Optional[ServicoService] = None


def set_servico_service(service: ServicoService) -> None:
    global _service
    _service = service


def _get_service() -> ServicoService:
    if _service is None:
        raise HTTPException(status_code=500, detail="Servico de servico nao inicializado")
    return _service


class ServicoCreate(BaseModel):
    cod_orgao: int
    cod_ocorrencia: int
    nome: str
    descr: Optional[str] = None
    inicio_servico: Optional[date] = None
    fim_servico: Optional[date] = None


class ServicoUpdate(BaseModel):
    cod_orgao: Optional[int] = None
    cod_ocorrencia: Optional[int] = None
    nome: Optional[str] = None
    descr: Optional[str] = None
    inicio_servico: Optional[date] = None
    fim_servico: Optional[date] = None


def _date_to_iso(value: Optional[date]) -> Optional[str]:
    return value.isoformat() if value else None


@router.get("/")
def listar_servicos() -> Sequence[Dict[str, Any]]:
    service = _get_service()
    return service.list_servicos()


@router.get("/ocorrencia/{cod_ocorrencia}")
def obter_servicos_por_ocorrencia(cod_ocorrencia: int) -> Sequence[Dict[str, Any]]:
    service = _get_service()
    return service.get_servicos_by_ocorrencia(cod_ocorrencia)


@router.post("/")
def criar_servico(payload: ServicoCreate) -> Dict[str, Any]:
    service = _get_service()
    created = service.create_servico(
        cod_orgao=payload.cod_orgao,
        cod_ocorrencia=payload.cod_ocorrencia,
        nome=payload.nome,
        descr=payload.descr,
        inicio_servico=_date_to_iso(payload.inicio_servico),
        fim_servico=_date_to_iso(payload.fim_servico),
    )
    return created


@router.put("/{cod_servico}")
def atualizar_servico(cod_servico: int, payload: ServicoUpdate) -> Dict[str, Any]:
    service = _get_service()
    update_fields: Dict[str, Any] = payload.model_dump(exclude_unset=True)

    if "inicio_servico" in update_fields and update_fields["inicio_servico"] is not None:
        update_fields["inicio_servico"] = update_fields["inicio_servico"].isoformat()
    if "fim_servico" in update_fields and update_fields["fim_servico"] is not None:
        update_fields["fim_servico"] = update_fields["fim_servico"].isoformat()

    updated = service.update_servico(cod_servico, **update_fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Servico nao encontrado")
    return updated


@router.delete("/{cod_servico}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_servico(cod_servico: int) -> Response:
    service = _get_service()
    servico = service.get_servico_by_id(cod_servico)
    if not servico:
        raise HTTPException(status_code=404, detail="Servico nao encontrado")

    service.delete_servico(cod_servico)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

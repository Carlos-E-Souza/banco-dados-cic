from datetime import date
from typing import Any, Dict, Optional, Sequence

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, Field

from ..service.ocorrenciaService import OcorrenciaService

router = APIRouter(prefix="/ocorrencias")

_service: Optional[OcorrenciaService] = None


def set_ocorrencia_service(service: OcorrenciaService) -> None:
    global _service
    _service = service


def _get_ocorrencia_service() -> OcorrenciaService:
    if _service is None:
        raise HTTPException(status_code=500, detail="Servico de ocorrencia nao inicializado")
    return _service


class LocalidadePayload(BaseModel):
    estado: str = Field(..., min_length=1)
    cidade: str = Field(..., min_length=1)
    bairro: str = Field(..., min_length=1)


class OcorrenciaCreate(BaseModel):
    cod_tipo: int
    cpf_morador: str
    endereco: str
    data: date
    descr: Optional[str] = None
    cod_local: Optional[int] = None
    localidade: Optional[LocalidadePayload] = None


class OcorrenciaUpdate(BaseModel):
    cod_tipo: Optional[int] = None
    cpf_morador: Optional[str] = None
    endereco: Optional[str] = None
    data: Optional[date] = None
    descr: Optional[str] = None
    cod_local: Optional[int] = None
    localidade: Optional[LocalidadePayload] = None


@router.get("/")
def listar_ocorrencias() -> Sequence[Dict[str, Any]]:
    service = _get_ocorrencia_service()
    return service.list_ocorrencias()


@router.get("/cpf/{cpf}")
def listar_ocorrencias_por_cpf(cpf: str) -> Sequence[Dict[str, Any]]:
    service = _get_ocorrencia_service()
    return service.list_ocorrencias_by_morador(cpf)


@router.post("/")
def criar_ocorrencia(payload: OcorrenciaCreate) -> Dict[str, Any]:
    service = _get_ocorrencia_service()

    if payload.cod_local is None and payload.localidade is None:
        raise HTTPException(status_code=400, detail="Informe cod_local ou dados de localidade")

    try:
        created = service.create_ocorrencia(
            cod_tipo=payload.cod_tipo,
            cpf_morador=payload.cpf_morador,
            endereco=payload.endereco,
            data=payload.data.isoformat(),
            tipo_status="NAO INICIADA",
            descr=payload.descr,
            cod_local=payload.cod_local,
            localidade=payload.localidade.model_dump() if payload.localidade else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return created


@router.put("/{cod_oco}")
def atualizar_ocorrencia(cod_oco: int, payload: OcorrenciaUpdate) -> Dict[str, Any]:
    service = _get_ocorrencia_service()

    update_fields: Dict[str, Any] = payload.model_dump(exclude_unset=True)
    if "data" in update_fields and update_fields["data"] is not None:
        update_fields["data"] = update_fields["data"].isoformat()
    if "localidade" in update_fields and update_fields["localidade"] is not None:
        localidade = update_fields["localidade"]
        if isinstance(localidade, BaseModel):
            update_fields["localidade"] = localidade.model_dump()

    try:
        updated = service.update_ocorrencia(cod_oco, **update_fields)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not updated:
        raise HTTPException(status_code=404, detail="Ocorrencia nao encontrada")
    return updated


@router.delete("/{cod_oco}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_ocorrencia(cod_oco: int) -> Response:
    service = _get_ocorrencia_service()
    ocorrencia = service.get_ocorrencia_by_id(cod_oco)
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrencia nao encontrada")

    service.delete_ocorrencia(cod_oco)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

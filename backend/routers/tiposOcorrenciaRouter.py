from typing import Any, Dict, Optional, Sequence

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel

from ..service.tipoOcorrenciaService import TipoOcorrenciaService

router = APIRouter(prefix="/tipos-ocorrencias")

_service: Optional[TipoOcorrenciaService] = None


def set_tipos_ocorrencia_service(service: TipoOcorrenciaService) -> None:
    global _service
    _service = service


def _get_service() -> TipoOcorrenciaService:
    if _service is None:
        raise HTTPException(status_code=500, detail="Servico de tipos nao inicializado")
    return _service


class TipoOcorrenciaCreate(BaseModel):
    nome: str
    descr: Optional[str] = None
    orgao_pub: int


class TipoOcorrenciaUpdate(BaseModel):
    nome: Optional[str] = None
    descr: Optional[str] = None
    orgao_pub: Optional[int] = None


@router.get("/")
def listar_tipos() -> Sequence[Dict[str, Any]]:
    service = _get_service()
    return service.list_tipos_ocorrencia()


@router.get("/{cod_tipo}")
def obter_tipo(cod_tipo: int) -> Dict[str, Any]:
    service = _get_service()
    tipo = service.get_tipo_by_id(cod_tipo)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de ocorrencia nao encontrado")
    return tipo


@router.post("/")
def criar_tipo(payload: TipoOcorrenciaCreate) -> Dict[str, Any]:
    service = _get_service()
    created = service.create_tipo_ocorrencia(
        nome=payload.nome,
        descr=payload.descr,
        orgao_pub=payload.orgao_pub,
    )
    return created


@router.put("/{cod_tipo}")
def atualizar_tipo(cod_tipo: int, payload: TipoOcorrenciaUpdate) -> Dict[str, Any]:
    service = _get_service()
    update_fields: Dict[str, Any] = payload.model_dump(exclude_unset=True)

    updated = service.update_tipo_ocorrencia(cod_tipo, **update_fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Tipo de ocorrencia nao encontrado")
    return updated


@router.delete("/{cod_tipo}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_tipo(cod_tipo: int) -> Response:
    service = _get_service()
    tipo = service.get_tipo_by_id(cod_tipo)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de ocorrencia nao encontrado")

    service.delete_tipo_ocorrencia(cod_tipo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

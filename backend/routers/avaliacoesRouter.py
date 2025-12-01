from typing import Any, Dict, Optional, Sequence

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel

from ..service.avaliacaoService import AvaliacaoService

router = APIRouter(prefix="/avaliacoes")

_service: Optional[AvaliacaoService] = None


def set_avaliacao_service(service: AvaliacaoService) -> None:
    global _service
    _service = service


def _get_service() -> AvaliacaoService:
    if _service is None:
        raise HTTPException(status_code=500, detail="Servico de avaliacao nao inicializado")
    return _service


class AvaliacaoCreate(BaseModel):
    cod_ocorrencia: int
    cod_servico: int
    cpf_morador: str
    nota_serv: int
    nota_tempo: int
    opiniao: Optional[str] = None


class AvaliacaoUpdate(BaseModel):
    cod_ocorrencia: Optional[int] = None
    cod_servico: Optional[int] = None
    cpf_morador: Optional[str] = None
    nota_serv: Optional[int] = None
    nota_tempo: Optional[int] = None
    opiniao: Optional[str] = None


@router.get("/")
def listar_avaliacoes() -> Sequence[Dict[str, Any]]:
    service = _get_service()
    return service.list_avaliacoes()


@router.get("/ocorrencia/{cod_ocorrencia}")
def obter_avaliacao_por_ocorrencia(cod_ocorrencia: int) -> Dict[str, Any]:
    service = _get_service()
    avaliacao = service.get_avaliacao_by_ocorrencia(cod_ocorrencia)
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliacao nao encontrada")
    return avaliacao


@router.post("/")
def criar_avaliacao(payload: AvaliacaoCreate) -> Dict[str, Any]:
    service = _get_service()
    created = service.create_avaliacao(
        cod_ocorrencia=payload.cod_ocorrencia,
        cod_servico=payload.cod_servico,
        cpf_morador=payload.cpf_morador,
        nota_serv=payload.nota_serv,
        nota_tempo=payload.nota_tempo,
        opiniao=payload.opiniao,
    )
    return created


@router.put("/{cod_aval}")
def atualizar_avaliacao(cod_aval: int, payload: AvaliacaoUpdate) -> Dict[str, Any]:
    service = _get_service()
    update_fields: Dict[str, Any] = payload.model_dump(exclude_unset=True)

    updated = service.update_avaliacao(cod_aval, **update_fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Avaliacao nao encontrada")
    return updated


@router.delete("/{cod_aval}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_avaliacao(cod_aval: int) -> Response:
    service = _get_service()
    avaliacao = service.get_avaliacao_by_id(cod_aval)
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliacao nao encontrada")

    service.delete_avaliacao(cod_aval)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

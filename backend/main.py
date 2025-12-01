import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent

load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)


if __package__:
    from .routers import (
        loginRouter,
        cargosRouter,
        funcionariosRouter,
        moradoresRouter,
        ocorrenciasRouter,
        tiposOcorrenciaRouter,
        orgaosPublicosRouter,
        servicosRouter,
        avaliacoesRouter,
    )
    from .persistence.databaseManager import DatabaseManager
    from .service.funcionarioService import FuncionarioService
    from .service.moradorService import MoradorService
    from .service.ocorrenciaService import OcorrenciaService
    from .service.tipoOcorrenciaService import TipoOcorrenciaService
    from .service.orgaoPublicoService import OrgaoPublicoService
    from .service.servicoService import ServicoService
    from .service.avaliacaoService import AvaliacaoService
    from .service.cargoService import CargoService
else:
    import sys

    sys.path.append(str(BASE_DIR.parent))
    from backend.routers import (
        loginRouter,
        cargosRouter,
        funcionariosRouter,
        moradoresRouter,
        ocorrenciasRouter,
        tiposOcorrenciaRouter,
        orgaosPublicosRouter,
        servicosRouter,
        avaliacoesRouter,
    )
    from backend.persistence.databaseManager import DatabaseManager
    from backend.service.funcionarioService import FuncionarioService
    from backend.service.moradorService import MoradorService
    from backend.service.ocorrenciaService import OcorrenciaService
    from backend.service.tipoOcorrenciaService import TipoOcorrenciaService
    from backend.service.orgaoPublicoService import OrgaoPublicoService
    from backend.service.servicoService import ServicoService
    from backend.service.avaliacaoService import AvaliacaoService
    from backend.service.cargoService import CargoService


@asynccontextmanager
async def lifespan(_: FastAPI):
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL env nao configurada.")

    db_manager = DatabaseManager(database_url=database_url, echo=False)
    funcionario_service = FuncionarioService(db_manager)
    morador_service = MoradorService(db_manager)
    cargo_service = CargoService(db_manager)

    funcionariosRouter.set_funcionario_service(funcionario_service)
    moradoresRouter.set_morador_service(morador_service)
    cargosRouter.set_cargo_service(cargo_service)
    loginRouter.set_login_services(morador_service, funcionario_service)
    ocorrenciasRouter.set_ocorrencia_service(OcorrenciaService(db_manager))
    tiposOcorrenciaRouter.set_tipos_ocorrencia_service(TipoOcorrenciaService(db_manager))
    orgaosPublicosRouter.set_orgao_publico_service(OrgaoPublicoService(db_manager))
    avaliacoesRouter.set_avaliacao_service(AvaliacaoService(db_manager))
    servicosRouter.set_servico_service(ServicoService(db_manager))

    try:
        yield
    finally:
        db_manager.engine.dispose()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(loginRouter.router)
app.include_router(cargosRouter.router)
app.include_router(funcionariosRouter.router)
app.include_router(moradoresRouter.router)
app.include_router(ocorrenciasRouter.router)
app.include_router(tiposOcorrenciaRouter.router)
app.include_router(orgaosPublicosRouter.router)
app.include_router(servicosRouter.router)
app.include_router(avaliacoesRouter.router)


@app.get("/")
def root():
    return {"message": "No content "}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8001, reload=True)
    
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent

load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)
load_dotenv(dotenv_path=BASE_DIR.parent / ".env", override=False)


if __package__:
    from .routers import funcionarios
    from .persistence.databaseManager import DatabaseManager
    from .service.funcionarioService import FuncionarioService
else:
    import sys

    sys.path.append(str(BASE_DIR.parent))
    from backend.routers import funcionarios
    from backend.persistence.databaseManager import DatabaseManager
    from backend.service.funcionarioService import FuncionarioService


@asynccontextmanager
async def lifespan(_: FastAPI):
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL env nao configurada.")

    db_manager = DatabaseManager(database_url=database_url, echo=False)
    db_manager.create_schema_from_script()
    funcionarios.set_funcionario_service(FuncionarioService(db_manager))

    try:
        yield
    finally:
        db_manager.engine.dispose()


app = FastAPI(lifespan=lifespan)

app.include_router(funcionarios.router)


@app.get("/")
def root():
    return {"message": "No content "}
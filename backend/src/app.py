from fastapi import FastAPI

from src.routers.auth import auth_router
from src.routers.hello_world import hello_world_router

app = FastAPI()

app.include_router(hello_world_router)
app.include_router(auth_router)

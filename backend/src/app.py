from fastapi import FastAPI

from src.routers.hello_world import hello_world_router

app = FastAPI()

app.include_router(hello_world_router)

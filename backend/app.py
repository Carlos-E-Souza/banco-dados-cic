from fastapi import FastAPI

from routers.hello_world import hello_world_router

app = FastAPI()

app.include_router(hello_world_router)

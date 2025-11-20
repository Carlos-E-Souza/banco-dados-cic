from http import HTTPStatus

from fastapi import APIRouter

from src.schemas import Message

hello_world_router = APIRouter()


@hello_world_router.get(
    '/hello_world', response_model=Message, status_code=HTTPStatus.OK
)
def hello_world():
    return {'message': 'Hello World!'}

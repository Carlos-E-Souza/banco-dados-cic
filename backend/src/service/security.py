from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from jwt import encode
from pwdlib import PasswordHash

from src.settings import Settings

pwd_context = PasswordHash.recommended()


def get_password_hash(pwd: str) -> str:
    return pwd_context.hash(pwd)


def verify_password_hash(pwd: str, hash: str) -> bool:
    return pwd_context.hash(pwd) == hash


def create_access_token(data: dict):
    settings = Settings()  # type: ignore
    to_encode = data.copy()
    expire = datetime.now(tz=ZoneInfo('UTC')) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({'exp': expire})
    encoded_jwt = encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

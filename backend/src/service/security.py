from pwdlib import PasswordHash

pwd_context = PasswordHash.recommended()


def get_password_hash(pwd: str) -> str:
    return pwd_context.hash(pwd)


def verify_password_hash(pwd: str, hash: str) -> bool:
    return pwd_context.verify(pwd, hash)

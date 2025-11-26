from datetime import datetime

from pydantic import BaseModel, EmailStr


class MoradorPublic(BaseModel):
    cpf: str
    nome: str
    cod_local: int
    data_nasc: datetime


class MoradorSchema(MoradorPublic):
    senha: str


class FuncionarioPublic(BaseModel):
    cpf: str
    orgao_pub: int
    cargo: int
    nome: str
    data_nasc: datetime
    inicio_contrato: datetime
    fim_contrato: datetime | None


class FuncionarioSchema(FuncionarioPublic):
    senha: str


class Email(BaseModel):
    email: EmailStr


class Message(BaseModel):
    message: str

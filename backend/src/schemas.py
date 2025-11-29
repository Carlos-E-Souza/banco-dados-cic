from datetime import datetime

from pydantic import BaseModel


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
    email: str


class Telefone(BaseModel):
    telefone: str
    ddd: str


class Contatos(BaseModel):
    emails: list[Email]
    telefones: list[Telefone] | None


class Morador_Com_Contatos(BaseModel):
    contatos: Contatos
    morador: MoradorPublic


class LoginResult(BaseModel):
    funcionario: bool
    data: FuncionarioPublic | MoradorPublic


class Message(BaseModel):
    message: str

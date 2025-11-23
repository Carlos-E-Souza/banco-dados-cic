# Sistema de Ouvidoria - Backend

## Introdução

Projeto da matéria de Banco de Dados da turma 1 e 2 do semestre 2025.2 da UnB.

Nessa parte do projeto tem como objetivo principal a implementação da camada de persistência sem a utilização de frameworks ORM.

## Escolhas Técnicas

A camada de persistência foi implementada utilizando o banco de dados MySQL, através da API do SQLAlchemy e sem o uso do ORM.

Além disso, ela é divida em DataBaseManager, SingletonDb, ObjectDb, Filter, Param, Collector e FactoryObjectDb.

- DataBaseManager:
    - Gerencia a conexão com o banco de dados;
    - Cria as tabelas se necessário; e
    - Centraliza a comunicação com o banco de dados.
- SingletonDb:
    - Garante que apenas uma conexão com o banco de dados seja criada.
- ObjectDb:
    - É utilizado para trabalhar com os dados do banco e alterá-los, através das operações de update, delete e da chamada do DataBaseManager para efetuar as operações no banco de dados.
- Filter:
    - É um objeto que é passado para o Collector para criar instancias de ObjectDb com os dados do banco;
- Param:
    - Compõe o Filter.
- Collector:
    - É utilizado para coletar os dados do banco de dados e criar instancias de ObjectDb, através do FactoryObjectDb.
- FactoryObjectDb:
    - É utilizado para criar instancias de ObjectDb.


## Requisitos

- Python 3.13;
- Poetry; e
- Docker.

# Como rodar os testes

Entre na pasta do projeto e execute:

```
# para instalar as dependências
poetry install

# para executar os testes
poetry run task test

# para iniciar o servidor no modo dev
poetry run task run
```

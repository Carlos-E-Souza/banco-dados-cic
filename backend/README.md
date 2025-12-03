# Backend – Guia de Execução

Este diretório contém a API FastAPI responsável pela camada de serviços da aplicação de Ouvidoria. Siga o passo a passo abaixo para configurar o ambiente localmente e iniciar o servidor.

## Pré-requisitos
- Python 3.10+ instalado
- Acesso a um banco de dados compatível com SQLAlchemy via `pymysql` (ex.: MySQL ou MariaDB)
- (Opcional, mas recomendado) `virtualenv` ou `venv` para isolamento do ambiente Python

## 1. Clonar o repositório
```bash
git clone https://github.com/Carlos-E-Souza/banco-dados-cic.git
cd banco-dados-cic/backend
```

## 2. Criar e ativar um ambiente virtual
```bash
python -m venv .venv
source .venv/bin/activate 
```

## 3. Instalar dependências
```bash
pip install -r requirements.txt
```

## 4. Configurar variáveis de ambiente
O aplicativo espera um arquivo `.env` na raiz de `backend/` com a variável `DATABASE_URL`.

Crie o arquivo `.env` a partir do exemplo abaixo (ajuste host, porta, usuário, senha e nome do banco conforme o seu ambiente):

```env
DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/nome_do_banco
```

## 5. Executar as migrações/seed (opcional)
Se desejar popular o banco com dados iniciais, utilize os scripts SQL presentes na pasta `sql/` do repositório, executando-os na sua instância do banco de dados.

## 6. Rodar o servidor FastAPI
Ative o ambiente virtual (caso ainda não esteja ativo) e execute:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
```

O parâmetro `--reload` reinicia o servidor automaticamente ao detectar mudanças de código, útil para desenvolvimento.

Alternativamente, é possível executar diretamente o módulo principal:

```bash
python main.py
```

## 7. Testar a API
- A documentação interativa estará disponível em `http://localhost:8001/docs`
- A especificação OpenAPI pura pode ser acessada em `http://localhost:8001/openapi.json`

## 8. Desativar o ambiente virtual
Após finalizar os testes:

```bash
deactivate
```

## Observações adicionais
- Certifique-se de que o usuário do banco tenha permissões de leitura e escrita.
- Ajuste as configurações de CORS ou portas conforme necessário para integração com o frontend.

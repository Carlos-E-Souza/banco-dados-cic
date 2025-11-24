FROM python:3.13-slim

ENV POETRY_VIRTUALENVS_CREATE=false

# Dependências essenciais para compilação e evitar erros de libs
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-setuptools \
    && apt-get clean

WORKDIR /app

COPY pyproject.toml poetry.lock* ./

RUN pip install --no-cache-dir poetry

RUN poetry config installer.max-workers 10

RUN poetry install --no-interaction --no-ansi --no-root --without dev

COPY . .

EXPOSE 8000

CMD ["poetry", "run", "uvicorn", "--host", "0.0.0.0", "src.app:app"]

# Frontend – Guia de Execução

Este diretório abriga o projeto Next.js responsável pela interface da aplicação de Ouvidoria. As instruções abaixo descrevem como preparar o ambiente e iniciar o frontend utilizando o comando `npm run start`.

## Pré-requisitos
- Node.js 18+ instalado (inclui npm)
- (Opcional) `nvm` para gerenciar múltiplas versões do Node.js

## 1. Clonar o repositório
```bash
git clone https://github.com/Carlos-E-Souza/banco-dados-cic.git
cd banco-dados-cic/frontend/ouvidoria
```

## 2. Instalar dependências
```bash
npm install
```

## 3. Configurar variáveis de ambiente (se necessário)
Caso o frontend consuma URLs específicas do backend, configure um arquivo `.env.local` na pasta `ouvidoria/` com as variáveis esperadas pelo código (exemplo):

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

## 4. Build de produção
Antes de iniciar o servidor de produção, é necessário gerar os artefatos:

```bash
npm run build
```

## 5. Iniciar o servidor
Execute o comando abaixo para rodar o frontend com o servidor Next.js em modo produção:

```bash
npm run start
```

O projeto estará disponível em `http://localhost:8000`.

## 6. Scripts úteis adicionais
- `npm run lint`: executa o ESLint para verificar problemas de linting.
- `npm run dev`: inicia o servidor Next.js em modo desenvolvimento (hot reload).

## 7. Encerrar a aplicação
Pressione `Ctrl+C` no terminal onde o servidor estiver rodando.

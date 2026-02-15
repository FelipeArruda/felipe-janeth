# Felipe & Janeth

Guia rapido para rodar o projeto localmente.

## Pre-requisitos

- Node.js 20+ (recomendado)
- npm 10+
- Docker Desktop

## Opcao A: Rodar tudo no Docker (app + api + postgres)

Suba todo o stack:

```bash
docker compose -f docker-compose.local.yml up -d
```

Acompanhar logs:

```bash
docker compose -f docker-compose.local.yml logs -f
```

Parar stack:

```bash
docker compose -f docker-compose.local.yml down
```

URLs locais:

- App (Vite): `http://localhost:5173`
- API: `http://localhost:5174/api/health`
- PostgreSQL: `localhost:5432`

Credenciais do banco no Docker local:

- database: `felipe_janeth`
- user: `felipe`
- password: `felipe123`

## Opcao B: Rodar manualmente no host

### 1) Instalar dependencias

```bash
npm install
```

### 2) Subir somente PostgreSQL no Docker

```bash
docker compose -f docker-compose.postgres.yml up -d
```

### 3) Configurar variaveis de ambiente

Crie/edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
VITE_API_URL=http://localhost:5174

DATABASE_URL=postgresql://felipe:felipe123@localhost:5432/felipe_janeth
ADMIN_EMAIL=admin@local
ADMIN_PASSWORD=admin123
ADMIN_JWT_SECRET=dev-secret-change-me
```

Opcional para conexao SSL com Postgres remoto:

```env
# PGSSLMODE=require
# DATABASE_SSL=true
```

### 4) Iniciar o backend (API)

```bash
npm run dev:server
```

### 5) Iniciar o frontend (Vite)

```bash
npm run dev
```

## Comandos uteis

- `npm run seed:admin`: cria/administra usuario admin inicial
- `npm run typecheck`: valida TypeScript
- `npm run lint`: roda ESLint
- `npm run build`: gera build de producao
- `npm run preview`: testa build localmente

# OmniSpace

> **B2B Multi-Tenant Workspace & Client Portal Engine**
> Built for agencies that manage projects and deliver transparency to their clients.

[![CI](https://github.com/your-org/omnispace/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/omnispace/actions/workflows/ci.yml)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS 10 · Prisma · PostgreSQL 16 · Redis 7 · BullMQ |
| **Frontend** | React 19 · Vite 8 · TailwindCSS v4 · TanStack Query · Zustand |
| **Auth** | JWT in HttpOnly cookie (no localStorage) |
| **Infrastructure** | Docker · Docker Compose · Nginx |
| **CI/CD** | GitHub Actions → GHCR |

---

## Quick Start (Development)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL + Redis)
- Node.js 20+
- `make` (pre-installed on macOS/Linux)

### One-command Setup

```bash
# Clone the repo
git clone https://github.com/your-org/omnispace.git
cd omnispace

# Full first-time setup (copies envs, installs deps, starts infra, migrates DB, seeds data)
make setup
```

Then in **two separate terminals**:

```bash
# Terminal 1 — Backend (http://localhost:3000)
make dev-backend

# Terminal 2 — Frontend (http://localhost:5173)
make dev-frontend
```

### Demo Accounts (password: `Password123!`)

| Role | Email |
|------|-------|
| Super Admin | admin@acme.test |
| Project Manager | pm@acme.test |
| Developer | dev@acme.test |
| Client | client@acme.test |

---

## Production Deployment

### With Docker Compose

```bash
# 1. Configure environment
cp .env.example .env
# → Edit .env with real secrets (strong passwords, JWT secret, your domain)

# 2. Build and start all services
make prod-build
make prod-up

# 3. Verify everything is healthy
make prod-ps
```

The app will be available at `http://your-server-ip` (port 80).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_USER` | ✅ | PostgreSQL username |
| `POSTGRES_PASSWORD` | ✅ | PostgreSQL password (use a strong password!) |
| `POSTGRES_DB` | ✅ | Database name (default: `omnispace`) |
| `REDIS_PASSWORD` | ✅ | Redis password (never leave empty in production!) |
| `JWT_SECRET` | ✅ | JWT signing secret — generate with `openssl rand -hex 64` |
| `FRONTEND_URL` | ✅ | Your app's public URL (for CORS) |
| `VITE_API_BASE_URL` | ✅ | API base URL for the frontend (use `/api/v1` with Nginx) |

---

## Project Structure

```
omnispace/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── common/           # Guards, filters, interceptors, decorators
│   │   ├── prisma/           # PrismaService (global)
│   │   ├── redis/            # ioredis client + throttler storage
│   │   └── modules/
│   │       ├── auth/         # Register-tenant, login, logout, me
│   │       ├── dashboard/    # Role-aware aggregate metrics
│   │       ├── projects/     # CRUD + tenant/role scoping
│   │       ├── tasks/        # Kanban board (drag-and-drop positions)
│   │       ├── team/         # Internal staff directory
│   │       ├── clients/      # Client org management
│   │       ├── portal/       # Client-only project view
│   │       ├── comments/     # Project/task discussions
│   │       └── reports/      # Async BullMQ PDF report jobs
│   └── prisma/
│       ├── schema.prisma     # Database schema
│       └── seed.ts           # Demo data seeder
│
├── frontend/                 # React SPA
│   └── src/
│       ├── components/       # Shared UI components
│       ├── features/         # Feature modules (auth, dashboard, projects…)
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # AppShell, page layouts
│       ├── lib/              # Axios instance, utilities
│       ├── routes/           # React Router config
│       ├── store/            # Zustand stores
│       └── types/            # Shared TypeScript types
│
├── infrastructure/
│   ├── docker/
│   │   ├── backend/          # Backend multi-stage Dockerfile
│   │   ├── frontend/         # Frontend multi-stage Dockerfile
│   │   └── nginx/            # Nginx configs (reverse proxy + SPA)
│   └── scripts/
│       ├── entrypoint.sh     # Backend: migrate → start
│       └── init-db.sh        # PostgreSQL: enable extensions
│
├── .github/
│   └── workflows/
│       ├── ci.yml            # Lint + type-check on every push/PR
│       └── cd.yml            # Build + push Docker images on main
│
├── docker-compose.yml        # Development: PostgreSQL + Redis only
├── docker-compose.prod.yml   # Production: all services
├── Makefile                  # Developer shortcuts (`make help`)
└── .env.example              # Environment variable template
```

---

## Developer Commands

Run `make help` to see all available commands:

```
make setup          Full first-time setup
make infra          Start PostgreSQL + Redis (Docker)
make dev-backend    Start NestJS in watch mode
make dev-frontend   Start Vite dev server
make migrate        Run Prisma migrations
make seed           Seed demo data
make studio         Open Prisma Studio
make lint           Lint all code
make typecheck      TypeScript check all
make prod-build     Build production Docker images
make prod-up        Start production stack
make prod-logs      Tail production logs
```

---

## Architecture Highlights

- **Multi-tenancy**: Every significant model carries `tenantId`. The JWT payload embeds `{ sub, tenantId, role }`. Every service filters by `tenantId` — cross-tenant data leakage is architecturally impossible.
- **RBAC**: Global guard chain: `ThrottlerGuard → JwtAuthGuard → RolesGuard`. Client Portal routes add a secondary ownership check (`assertClientOwnsProject`).
- **Async Reports**: `POST /reports/monthly` returns `202 Accepted` immediately, enqueues a BullMQ job, and the worker processes it in the background. Frontend polls `GET /reports/:jobId`.
- **Kanban Positions**: `PATCH /tasks/:id/status` reorders sibling tasks atomically in a Prisma transaction — no position collisions.
- **Security**: Helmet (HTTP headers) + Gzip compression + Redis-backed rate limiting + HttpOnly JWT cookies.

---

## What's Left to Implement

| Feature | Status |
|---------|--------|
| PDF rendering | Stubbed (4s delay + placeholder URL) — wire in Puppeteer/PDFKit |
| File serving for reports | Not implemented — point at object storage (S3/GCS) |
| Email (invitations, password reset) | Not in scope |
| TLS/HTTPS | Add cert to Nginx config + uncomment 443 port in docker-compose.prod.yml |
| Unit & Integration tests | Not implemented — add Jest (backend) + Vitest (frontend) |

---

## License

UNLICENSED — Private project.

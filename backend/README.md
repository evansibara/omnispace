# OmniSpace Backend

A multi-tenant B2B workspace & client-portal engine built with **NestJS**, **Prisma/PostgreSQL**, **Redis**, and **BullMQ** — implemented per the OmniSpace SaaS specification.

## Stack

| Concern              | Choice                                              |
|----------------------|------------------------------------------------------|
| Framework            | NestJS 10 (Express adapter)                          |
| Database             | PostgreSQL via Prisma ORM                             |
| Auth                  | JWT in an HttpOnly cookie (no Bearer tokens, no localStorage) |
| Rate limiting         | `@nestjs/throttler`, Redis-backed storage             |
| Background jobs       | BullMQ (Redis) — async monthly report generation     |
| Validation             | `class-validator` / `class-transformer`             |

## Getting started

```bash
cp .env.example .env          # adjust secrets as needed
docker compose up -d          # starts Postgres + Redis locally
npm install
npx prisma migrate dev        # creates the schema
npx prisma db seed            # optional: demo tenant + 4 role accounts
npm run start:dev
```

The API is served under the prefix configured by `API_PREFIX` (default `api/v1`), e.g. `http://localhost:3000/api/v1`.

### Demo accounts (after `npx prisma db seed`)

All share the password `Password123!`:

| Role            | Email             |
|-----------------|-------------------|
| SUPER_ADMIN     | admin@acme.test   |
| PROJECT_MANAGER | pm@acme.test      |
| DEVELOPER       | dev@acme.test     |
| CLIENT          | client@acme.test  |

## Architecture notes

- **Multi-tenancy**: every row that matters carries a `tenantId`. The JWT payload embeds `{ sub, tenantId, role }`; the global `JwtAuthGuard` decodes the cookie and attaches `{ id, tenantId, role }` to `request.user`. Every service method filters by `tenantId` — there is no way to read across tenants even if an attacker guesses another tenant's UUIDs.
- **RBAC**: `@Roles(...)` + `RolesGuard` enforce the SUPER_ADMIN / PROJECT_MANAGER / DEVELOPER / CLIENT hierarchy. For the **Client Portal** routes (`/portal`, `/comments`, `/reports`), role membership alone isn't sufficient — `ProjectsService.assertClientOwnsProject` re-verifies that the CLIENT caller's organization actually owns the project being touched, so a client can never reach another client's data by guessing IDs.
- **Response envelope**: a global `ResponseInterceptor` wraps every success response as `{ success: true, message, data, meta? }`. A global `HttpExceptionFilter` normalizes every error (validation, 401/403/404, or unexpected 500) into `{ success: false, message, statusCode, errors? }`, so the frontend's Axios interceptor only needs one shape to handle.
- **Kanban drag-and-drop**: `PATCH /tasks/:id/status` re-sequences every sibling task in the destination column (and the source column, if it changed) inside a single Prisma transaction, so position integers never collide regardless of what the client sends.
- **Async PDF reports**: `POST /projects/:id/reports/monthly` immediately creates a `ReportJob` row (`QUEUED`) and enqueues a BullMQ job, returning `202 Accepted` without blocking. A worker (`ReportsProcessor`) flips the job to `PROCESSING`, simulates rendering, then `READY` (or `FAILED`). The frontend is expected to poll `GET /reports/:jobId`. Swap the `setTimeout` simulation in `reports.processor.ts` for real PDF rendering + object storage upload when ready.
- **Rate limiting**: `ThrottlerStorageRedisService` backs `@nestjs/throttler` with Redis so counters survive restarts/multiple instances. Stricter `@Throttle()` overrides are applied to `POST /auth/login`, `POST /auth/register-tenant`, and `POST /projects`.

## Project layout

```
src/
  common/            # guards, decorators, filters, interceptors, shared types
  prisma/            # PrismaService (global)
  redis/             # ioredis client + Redis-backed Throttler storage
  modules/
    auth/            # register-tenant, login, logout, me
    dashboard/       # role-aware aggregate metrics
    clients/         # client-org picker (for the "new project" form)
    projects/        # CRUD + tenant/role scoping
    tasks/           # kanban board: list/create/move
    team/             # internal staff directory
    comments/        # project/task discussion thread (internal + client)
    portal/          # client-only single-project view
    reports/         # async monthly PDF report job + BullMQ worker
prisma/
  schema.prisma
  seed.ts
```

## What's stubbed / left for you

- **PDF rendering** is simulated (a 4s delay + a placeholder `downloadUrl`). Wire in Puppeteer/PDFKit + S3/GCS when ready.
- **File serving** for `downloadUrl` (`/files/reports/:id.pdf`) isn't implemented — point it at your object storage / a static file controller.
- **Email** (invitations, password reset) isn't in scope of the provided spec and isn't implemented.
- Prisma's engine binaries could not be downloaded in the sandbox this was built in (network egress is restricted to package registries only), so `npx prisma generate` / `migrate dev` have not been run here — they will work normally on your machine with standard internet access. Everything else (TypeScript compiles cleanly against the rest of the codebase) has been verified.

# OmniSpace — Frontend

B2B multi-tenant workspace and client portal for agencies and software houses. This is the frontend half of the OmniSpace platform: a React + TypeScript SPA that gives internal staff (Super Admin, Project Manager, Developer) a Kanban-driven project workspace, and gives external clients an isolated, read-only portal to track progress and leave feedback.

Built to pair with a NestJS + PostgreSQL + Prisma backend (see the companion PRD), but ships with typed API contracts so the two can be developed independently.

## Tech stack

| Concern | Choice |
|---|---|
| Build tool | Vite |
| Language | TypeScript (strict mode, zero `any`) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Server state | TanStack Query v5 |
| Client/UI state | Zustand |
| Forms & validation | React Hook Form + Zod |
| HTTP | Axios (cookie-based auth, no tokens in JS) |
| Drag-and-drop | @dnd-kit |
| Charts | Recharts |
| Routing | React Router v6 (data router) |

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

```bash
npm run build      # type-check + production build
npm run preview     # preview the production build locally
```

## Project structure

```
src/
├── components/          # Cross-feature, reusable UI
│   ├── ui/               # Primitives: Button, Input, Card, Badge, Dialog, Select...
│   ├── common/           # Domain-aware shared bits: StatusBadge, RoleGate
│   └── feedback/          # ErrorBoundary, EmptyState, spinners
├── config/               # Axios instance, QueryClient setup
├── features/             # Feature-based modules (the bulk of the app)
│   ├── auth/              # Login, register-tenant, session, route guard
│   ├── dashboard/          # Metrics widgets, milestone list
│   ├── projects/           # Project matrix, search/filter/pagination, create modal
│   ├── kanban/             # Drag-and-drop board, task cards, optimistic mutations
│   ├── portal/             # Client-facing progress tracker, feedback thread, PDF report trigger
│   └── team/               # Team management + billing (internal-only)
├── layouts/               # AppShell, Sidebar (role-aware nav), Topbar
├── lib/                  # cn(), formatters
├── hooks/                # Cross-feature hooks (useDebouncedValue)
├── store/                # Zustand stores (auth snapshot, UI state)
├── routes/               # Router definition, 404 page
└── types/                # Shared domain types (User, Tenant, Project, Task, ApiResponse...)
```

Each feature folder follows the same internal shape: `api/` (Axios calls), `hooks/` (TanStack Query wrappers), `components/`, `pages/`, `schemas/` (Zod), `types/`.

## Architecture notes

**Auth & multi-tenancy.** The backend is expected to issue the session JWT inside an HttpOnly cookie carrying `tenant_id` and `role_id`. The frontend never reads, stores, or refreshes a token — every request rides on `apiClient` with `withCredentials: true`, and a 401 anywhere triggers a global redirect to `/login` via an Axios interceptor (`src/config/axios.ts`). `useSession` (TanStack Query, backed by `GET /auth/me`) is the single source of truth for "is there a valid session"; the Zustand auth store is just a synchronous mirror of that result for components that can't await a query (sidebar, route guards).

**RBAC, in two layers.**
1. **Routing** — `<ProtectedRoute allowedRoles={[...]}>` wraps route groups so a Developer hitting `/team` or a Client hitting `/projects` gets redirected before any internal UI mounts.
2. **Presentation** — `<RoleGate allow={[...]}>` strips elements (like "New Project" or "New Task" buttons) out of the DOM entirely for roles that shouldn't see them, rather than just hiding them with CSS. This matches the brief's "Data Isolation Constraints" for the client portal — a disabled-but-present button is still inspectable; an unmounted one isn't there to inspect. The backend's `RolesGuard` remains the actual enforcement boundary; this is its UI-side counterpart.

**State separation (NFR-3).** Server data (projects, tasks, session, comments) lives exclusively in TanStack Query. Zustand only ever holds client-only state: the current auth snapshot and UI toggles (sidebar collapse, which modal is open). Nothing fetched from the network is duplicated into a Zustand store as a cache — that's what the query cache is for.

**Kanban optimistic updates.** Dragging a card calls `useUpdateTaskStatus`, which writes the new column/position into the TanStack Query cache inside `onMutate` — before the network request resolves — so the UI never shows a loading spinner mid-drag. If the server rejects the move, `onError` restores the exact pre-drag snapshot.

**Async PDF reports (Epic 4).** `ReportTrigger` calls a "start job" endpoint that returns immediately with a job id, then polls `GET /reports/:id` via `useReportJobStatus` until the backend's worker marks it `READY` or `FAILED`. The UI never blocks waiting for PDF generation to finish synchronously.

## Design system

Custom token set ("Ink & Signal") defined in `src/index.css` via Tailwind's `@theme`: dark `ink` surfaces for navigation, a `paper` canvas for work areas, one decisive `signal` blue for actions, and a fixed status/priority palette reused identically across project badges, task cards, and the client portal so the same color always means the same thing everywhere in the app. Display type is Manrope, body/UI is Inter, and metrics/dates render in JetBrains Mono for a more instrument-panel feel on numeric data.

## What's mocked vs. real

This repo is frontend-complete against the API contract implied by the PRD — every endpoint is called through typed functions in each feature's `api/` folder. There is no backend in this repo; point `VITE_API_BASE_URL` at a running NestJS instance that implements the routes referenced there (see the PRD's §4B endpoint list) to go end-to-end.

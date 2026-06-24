<div align="center">

# 🌐 OmniSpace

**B2B Multi-Tenant Workspace & Client Portal Engine**

[![CI](https://github.com/evansibara/omnispace/actions/workflows/ci.yml/badge.svg)](https://github.com/evansibara/omnispace/actions/workflows/ci.yml)
[![CD](https://github.com/evansibara/omnispace/actions/workflows/cd.yml/badge.svg)](https://github.com/evansibara/omnispace/actions/workflows/cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red.svg)](#)

<p>
  Platform workspace B2B multi-tenant yang memisahkan jalur internal agensi dari portal klien eksternal secara aman — dibangun dengan standar industri enterprise.
</p>

</div>

---

## 📖 Tentang Proyek

**OmniSpace** adalah platform workspace B2B berbasis *full-stack* yang dirancang untuk mendukung model multi-tenant. Aplikasi ini memungkinkan agensi atau tim internal mengelola proyek, anggota tim, dan billing — sekaligus menyediakan portal terpisah yang aman untuk klien eksternal.

Proyek ini diimplementasikan menggunakan standar *enterprise* modern dengan arsitektur yang bersih, pipeline CI/CD otomatis, dan ekosistem container yang sepenuhnya terisolasi.

---

## 🏗️ Arsitektur & Tech Stack

Monorepo ini terdiri dari tiga lapisan independen yang dapat dikembangkan dan di-deploy secara terpisah.

```
omnispace/
├── backend/          # NestJS REST API (Node.js)
├── frontend/         # React SPA (Vite)
├── infrastructure/   # Docker, Nginx, Scripts
└── .github/          # CI/CD Workflows (GitHub Actions)
```

---

### ⚙️ Backend (`/backend`)

RESTful API berbasis **NestJS** dengan arsitektur modular dan keamanan berlapis.

| Kategori | Teknologi |
|---|---|
| **Runtime** | Node.js 20, TypeScript 5.x |
| **Framework** | NestJS 10 |
| **ORM & Database** | Prisma 5, PostgreSQL 16 |
| **Auth** | JWT (`@nestjs/jwt`), bcryptjs |
| **Queue** | BullMQ, Redis 7 (ioredis) |
| **Keamanan** | Helmet, Throttler, Cookie-Parser, Compression |
| **Validasi** | class-validator, class-transformer |
| **Linting** | ESLint (`@typescript-eslint`), Prettier |

---

### 🎨 Frontend (`/frontend`)

*Single Page Application* modern berbasis **React 19** dengan DX dan performa tinggi.

| Kategori | Teknologi |
|---|---|
| **Core** | React 19, TypeScript 6.x, Vite 8 |
| **Routing** | React Router DOM 7 |
| **Server State** | TanStack React Query 5 |
| **Global State** | Zustand 5 |
| **Styling** | Tailwind CSS 4, clsx, tailwind-merge |
| **Forms & Validasi** | React Hook Form 7, Zod 4 |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Charts** | Recharts 3 |
| **Notifikasi** | Sonner |
| **Icons** | Lucide React |
| **Linting** | ESLint 10, eslint-plugin-react-refresh |

---

### 🐳 Infrastructure (`/infrastructure`)

Ekosistem containerisasi lengkap untuk development dan production.

| Komponen | Stack |
|---|---|
| **Database** | PostgreSQL 16 Alpine |
| **Cache & Queue** | Redis 7 Alpine |
| **Reverse Proxy** | Nginx (serving frontend + proxy ke backend) |
| **Containerization** | Docker & Docker Compose |
| **Registry** | GitHub Container Registry (GHCR) |

**Dua mode deployment:**
- `docker-compose.yml` — development (hanya infrastruktur: Postgres + Redis)
- `docker-compose.prod.yml` — production (full stack: Postgres + Redis + Backend + Nginx/Frontend)

---

### 🔄 CI/CD Pipeline (`/.github/workflows`)

Otomatisasi penuh dengan GitHub Actions untuk setiap push dan pull request.

```
Push / PR ke main atau develop
        │
        ▼
┌──────────────────────────────────────┐
│              CI Pipeline              │
│                                      │
│  backend-ci          frontend-ci     │
│  ├─ npm ci           ├─ npm ci       │
│  ├─ ESLint           ├─ ESLint       │
│  ├─ tsc --noEmit     ├─ tsc --noEmit │
│  └─ nest build       └─ vite build   │
└──────────────┬───────────────────────┘
               │ (hanya jika push ke main)
               ▼
┌──────────────────────────────────────┐
│              CD Pipeline              │
│                                      │
│  build-push-backend                  │
│  └─ Docker build → push ke GHCR     │
│                                      │
│  build-push-frontend                 │
│  └─ Docker build → push ke GHCR     │
└──────────────────────────────────────┘

Image tags: :latest  +  :sha-<commit>
```

**Fitur pipeline:**
- `concurrency` — CI membatalkan run lama di branch yang sama; CD tidak pernah dibatalkan
- Docker layer caching (`cache-from/to: type=gha`) untuk build yang lebih cepat
- Image immutable tagged per SHA commit untuk kemudahan rollback

---

## 🔐 Keamanan & Multi-Tenancy

OmniSpace memisahkan dua jalur akses secara eksplisit:

| Role | Akses |
|---|---|
| `SUPER_ADMIN`, `PROJECT_MANAGER`, `DEVELOPER` | Dashboard, Projects, Team, Billing |
| `CLIENT` | Client Portal (`/portal`) saja |

Setiap route dilindungi `<ProtectedRoute allowedRoles={[...]}>` — klien yang mencoba menebak URL `/projects` akan di-redirect, bukan mendapat halaman kosong dengan navigasi yang bocor.

---

## 🚀 Panduan Memulai (Quick Start)

### Prasyarat

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+

### 1. Clone & Konfigurasi Environment

```bash
git clone https://github.com/<username>/omnispace.git
cd omnispace

# Salin semua template environment
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Sesuaikan variabel di dalam masing-masing file `.env` jika diperlukan.

---

### 2. Jalankan via Docker (Direkomendasikan — Production Mode)

Menjalankan seluruh stack (Frontend, Backend, Database, Redis, Nginx) dengan satu perintah:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

| Layanan | URL |
|---|---|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost/api/v1 |
| **Health Check** | http://localhost/api/v1/health |

---

### 3. Jalankan Mode Development (Hot-Reload)

Cara terbaik untuk development aktif — backend dan frontend berjalan di host untuk hot-reload yang cepat (terutama di macOS, menghindari lambatnya bind-mount Docker).

**A. Jalankan infrastruktur (Postgres + Redis):**

```bash
docker compose up -d
```

**B. Jalankan Backend:**

```bash
cd backend
npm install
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET, REDIS_* dll
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Backend tersedia di: `http://localhost:3000/api/v1`

**C. Jalankan Frontend:**

```bash
cd frontend
npm install
cp .env.example .env   # isi VITE_API_BASE_URL=http://localhost:3000/api/v1
npm run dev
```

Frontend tersedia di: `http://localhost:5173`

---

## 🧪 Development & Quality Assurance

### Linting & Type Check

```bash
# Dari root — jalankan lint backend + frontend sekaligus
npm run lint

# Backend saja
cd backend && npm run lint

# Frontend saja
cd frontend && npm run lint

# Type check
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

### Build Verification

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Prisma (Database)

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Buat dan jalankan migration baru (development)
npm run prisma:migrate

# Deploy migration ke production
npm run prisma:deploy

# Seed database
npm run prisma:seed

# Buka Prisma Studio (GUI database)
npm run prisma:studio
```

---

## 🐳 Docker Images

Image production di-build dan di-push otomatis ke **GitHub Container Registry (GHCR)** setiap push ke branch `main`.

```bash
# Pull image terbaru
docker pull ghcr.io/<owner>/omnispace-backend:latest
docker pull ghcr.io/<owner>/omnispace-frontend:latest

# Pull versi spesifik via SHA (untuk rollback)
docker pull ghcr.io/<owner>/omnispace-backend:sha-<commit-sha>
docker pull ghcr.io/<owner>/omnispace-frontend:sha-<commit-sha>
```

---

## 📂 Struktur Folder Detail

```
omnispace/
├── .github/
│   └── workflows/
│       ├── ci.yml                   # CI: lint + type check + build
│       └── cd.yml                   # CD: build & push Docker image ke GHCR
│
├── backend/
│   ├── prisma/                      # Prisma schema & migrations & seed
│   ├── src/
│   │   ├── common/                  # Guards, decorators, pipes, interceptors
│   │   ├── modules/                 # Feature modules (auth, users, projects, dll)
│   │   ├── prisma/                  # Prisma service
│   │   ├── redis/                   # Redis service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .eslintrc.js
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/              # Shared UI components
│       ├── features/                # Feature-sliced modules
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── projects/
│       │   ├── team/
│       │   └── portal/
│       ├── layouts/                 # AppShell & layout components
│       ├── routes/                  # Router config & route components
│       └── main.tsx
│
├── infrastructure/
│   ├── docker/
│   │   ├── backend/Dockerfile
│   │   ├── frontend/Dockerfile
│   │   └── nginx/                   # nginx.conf & conf.d
│   └── scripts/
│       └── init-db.sh
│
├── docker-compose.yml               # Dev: Postgres + Redis only
├── docker-compose.prod.yml          # Prod: full stack
└── README.md
```

---

## 🌐 Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/omnispace?schema=public
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=omnispace

# Auth
JWT_SECRET=your-super-secret-jwt-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=omnispace_redis_dev
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Infrastructure (`infrastructure/.env` / `.env`)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=omnispace
POSTGRES_PORT=5432

REDIS_PASSWORD=your-secure-redis-password
REDIS_PORT=6379

JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://yourdomain.com
VITE_API_BASE_URL=/api/v1
```

---

## 📄 Lisensi

Proyek ini bersifat **UNLICENSED** — kode ini merupakan proyek privat. Tidak diperkenankan untuk digunakan, didistribusikan, atau dimodifikasi tanpa izin eksplisit dari pemilik.

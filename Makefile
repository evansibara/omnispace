# =============================================================================
# OmniSpace — Makefile
#
# Provides convenient shortcuts for common developer workflows.
# Run `make help` to see all available commands.
# =============================================================================

.PHONY: help dev infra down logs ps build migrate seed studio lint format \
        prod-up prod-down prod-logs clean

# ─── Colors ────────────────────────────────────────────────────────────────
BOLD   := \033[1m
RESET  := \033[0m
GREEN  := \033[32m
YELLOW := \033[33m
CYAN   := \033[36m

## ─── Default Target ───────────────────────────────────────────────────────

help: ## Show this help message
	@echo ""
	@echo "$(BOLD)OmniSpace — Developer Commands$(RESET)"
	@echo "────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

## ─── Development ──────────────────────────────────────────────────────────

infra: ## Start infrastructure services (PostgreSQL + Redis) in background
	@echo "$(GREEN)▶ Starting infrastructure services...$(RESET)"
	docker compose up -d
	@echo "$(GREEN)✓ PostgreSQL and Redis are running$(RESET)"

infra-down: ## Stop infrastructure services
	@echo "$(YELLOW)■ Stopping infrastructure services...$(RESET)"
	docker compose down

dev-backend: ## Start backend in dev mode (hot-reload)
	@echo "$(GREEN)▶ Starting backend...$(RESET)"
	cd backend && npm run start:dev

dev-frontend: ## Start frontend in dev mode (hot-reload)
	@echo "$(GREEN)▶ Starting frontend...$(RESET)"
	cd frontend && npm run dev

install: ## Install dependencies for backend and frontend
	@echo "$(GREEN)▶ Installing backend dependencies...$(RESET)"
	cd backend && npm ci
	@echo "$(GREEN)▶ Installing frontend dependencies...$(RESET)"
	cd frontend && npm ci
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

## ─── Database ─────────────────────────────────────────────────────────────

migrate: ## Run Prisma migrations (dev mode)
	@echo "$(GREEN)▶ Running Prisma migrations...$(RESET)"
	cd backend && npx prisma migrate dev

migrate-deploy: ## Run Prisma migrations (production-safe, no file generation)
	@echo "$(GREEN)▶ Deploying Prisma migrations...$(RESET)"
	cd backend && npx prisma migrate deploy

seed: ## Seed the database with demo data
	@echo "$(GREEN)▶ Seeding database...$(RESET)"
	cd backend && npm run prisma:seed

studio: ## Open Prisma Studio (database GUI)
	@echo "$(GREEN)▶ Opening Prisma Studio...$(RESET)"
	cd backend && npx prisma studio

reset-db: ## ⚠ Drop and recreate database (DEV ONLY!)
	@echo "$(YELLOW)⚠ WARNING: This will destroy all data! Press Ctrl+C to abort...$(RESET)"
	@sleep 3
	cd backend && npx prisma migrate reset --force

## ─── Code Quality ─────────────────────────────────────────────────────────

lint: ## Lint backend and frontend
	@echo "$(GREEN)▶ Linting backend...$(RESET)"
	cd backend && npm run lint
	@echo "$(GREEN)▶ Linting frontend...$(RESET)"
	cd frontend && npm run lint

format: ## Format backend code with Prettier
	@echo "$(GREEN)▶ Formatting backend...$(RESET)"
	cd backend && npm run format

typecheck: ## Run TypeScript type check on both projects
	@echo "$(GREEN)▶ Type checking backend...$(RESET)"
	cd backend && npx tsc --noEmit
	@echo "$(GREEN)▶ Type checking frontend...$(RESET)"
	cd frontend && npx tsc --noEmit

## ─── Docker Logs / Status ─────────────────────────────────────────────────

logs: ## Tail logs from all development containers
	docker compose logs -f

ps: ## Show status of all containers
	docker compose ps

## ─── Production ───────────────────────────────────────────────────────────

prod-build: ## Build production Docker images
	@echo "$(GREEN)▶ Building production images...$(RESET)"
	docker compose -f docker-compose.prod.yml build --no-cache

prod-up: ## Start all production services
	@echo "$(GREEN)▶ Starting production stack...$(RESET)"
	docker compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production stack is running at http://localhost$(RESET)"

prod-down: ## Stop production services
	@echo "$(YELLOW)■ Stopping production stack...$(RESET)"
	docker compose -f docker-compose.prod.yml down

prod-logs: ## Tail production logs
	docker compose -f docker-compose.prod.yml logs -f

prod-ps: ## Show status of production containers
	docker compose -f docker-compose.prod.yml ps

## ─── Cleanup ──────────────────────────────────────────────────────────────

clean: ## Remove all containers, volumes, and dangling images (⚠ destructive!)
	@echo "$(YELLOW)⚠ WARNING: This will delete all Docker data for this project!$(RESET)"
	@sleep 3
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.prod.yml down -v --remove-orphans
	docker image prune -f

## ─── Setup ────────────────────────────────────────────────────────────────

setup: ## Full first-time setup: copy env, install deps, start infra, migrate, seed
	@echo "$(BOLD)$(GREEN)OmniSpace — First-time Setup$(RESET)"
	@echo "────────────────────────────────────────"
	@if [ ! -f .env ]; then cp .env.example .env && echo "$(CYAN)✓ Created .env from .env.example$(RESET)"; fi
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env && echo "$(CYAN)✓ Created backend/.env$(RESET)"; fi
	@if [ ! -f frontend/.env ]; then echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > frontend/.env && echo "$(CYAN)✓ Created frontend/.env$(RESET)"; fi
	$(MAKE) install
	$(MAKE) infra
	@echo "$(YELLOW)Waiting 5s for database to initialize...$(RESET)"
	@sleep 5
	$(MAKE) migrate
	$(MAKE) seed
	@echo ""
	@echo "$(BOLD)$(GREEN)✓ Setup complete! Run these in separate terminals:$(RESET)"
	@echo "  $(CYAN)make dev-backend$(RESET)    → starts NestJS on http://localhost:3000"
	@echo "  $(CYAN)make dev-frontend$(RESET)   → starts Vite on http://localhost:5173"
	@echo ""
	@echo "  Demo accounts (password: Password123!):"
	@echo "  admin@acme.test | pm@acme.test | dev@acme.test | client@acme.test"

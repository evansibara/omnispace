# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — Builder
# Install all dependencies (including devDeps) and compile TypeScript.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install build dependencies for native modules (e.g. bcrypt) + OpenSSL
# (OpenSSL must be present so Prisma generates the engine for the correct target)
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install ALL deps (dev + prod) needed for the build step
RUN npm ci

# Copy Prisma schema before generating the client
COPY prisma ./prisma/

# Generate Prisma client for the correct platform
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — Production
# Lean image: only runtime artifacts, no devDependencies, non-root user.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install OpenSSL — required by Prisma's query/schema engine at runtime.
# Must run as root, BEFORE switching to the "node" user below.
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package manifests and install ONLY production dependencies
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client from builder
COPY --chown=node:node --from=builder /app/prisma ./prisma/
COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma/

# Copy compiled output
COPY --chown=node:node --from=builder /app/dist ./dist/

# Copy the entrypoint script
COPY --chown=node:node entrypoint.sh ./entrypoint.sh

EXPOSE 3000

# Security: run as the built-in "node" user (uid 1000) — switched AFTER
# all root-level setup (apk add, npm ci, file copies) is done.
USER node

# Entrypoint runs `prisma migrate deploy` then starts the app
ENTRYPOINT ["sh", "./entrypoint.sh"]
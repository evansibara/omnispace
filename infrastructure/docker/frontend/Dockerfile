# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — Builder
# Install dependencies and build the Vite/React app.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first to leverage layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDeps for the build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables injected at build time
# These are embedded by Vite into the static bundle.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Run the production build
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — Production
# Minimal Nginx image serving the compiled static assets.
# ──────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled frontend assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA (handles client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

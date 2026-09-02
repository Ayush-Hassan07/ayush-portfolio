# syntax=docker/dockerfile:1

# ============================================================
# Stage 1: Build the NestJS API
# ============================================================
FROM node:22-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Copy monorepo workspace configuration first.
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy the API package manifest separately for better caching.
COPY apps/api/package.json ./apps/api/package.json

# Install only the API workspace and its dependencies.
RUN pnpm install \
    --frozen-lockfile \
    --filter api...

# Copy the complete API source.
COPY apps/api ./apps/api

# Generate Prisma Client.
RUN pnpm --filter api exec prisma generate \
    --schema=prisma/schema.prisma

# Compile the NestJS API.
RUN pnpm --filter api build


# ============================================================
# Stage 2: Production runtime
# ============================================================
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

# pnpm workspace dependencies use symlinks that point into
# the root node_modules/.pnpm store, so both locations are kept.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Copy compiled API and generated Prisma client.
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/generated ./apps/api/generated
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

# Cloud Run convention.
EXPOSE 8080

CMD ["node", "dist/src/main.js"]
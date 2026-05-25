FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/backend ./apps/backend
COPY apps/shared ./apps/shared

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Build
RUN pnpm run build --filter=@vlx-flow/shared
RUN pnpm run build --filter=@vlx-flow/backend

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY apps/backend/.env.example ./.env

RUN mkdir -p logs

EXPOSE 3000

CMD ["node", "dist/server.js"]

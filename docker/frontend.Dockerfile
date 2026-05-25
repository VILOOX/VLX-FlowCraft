FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/frontend ./apps/frontend
COPY apps/backend ./apps/backend
COPY apps/shared ./apps/shared

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Build shared and frontend
RUN pnpm run build --filter=@vlx-flow/shared
RUN pnpm run build --filter=@vlx-flow/frontend

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/frontend/dist /app/public

EXPOSE 3000

CMD ["npm", "start"]

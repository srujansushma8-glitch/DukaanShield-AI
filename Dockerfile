# Stage 1: Build the Vite frontend
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve via Express backend
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install build tools for native module compilation (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./backend/
COPY --from=builder /app/dist ./dist

# Create volume mount directory for persistent SQLite DB with node user permissions
RUN mkdir -p /var/data && chown -R node:node /var/data /app

EXPOSE 5000

USER node

CMD ["npm", "run", "start"]

# ==============================================================================
# FitMentor AI — Production Multi-Stage Container Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend (Vite + React + Tailwind)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Backend (Node.js + Express + TypeScript)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci || npm install

COPY backend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Production Runner (Lightweight, Secure Runtime)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV FRONTEND_DIST_PATH=/app/frontend/dist

# Install production dependencies for backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev || npm install --omit=dev

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy compiled frontend for static SPA serving
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy database migrations and seed scripts
COPY database /app/database

# Expose server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start FitMentor AI application
CMD ["node", "dist/server.js"]


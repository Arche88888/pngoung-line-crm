FROM node:20-slim AS base
WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Install all dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
COPY tsconfig.base.json ./

# Build shared package first, then API
RUN npm run build --workspace @pngoung/shared 2>/dev/null || true
RUN npm run build --workspace @pngoung/api

# Create data directory
RUN mkdir -p data

# Expose port (Railway overrides with PORT env)
EXPOSE 3001

# Start
CMD ["node", "apps/api/dist/apps/api/src/index.js"]

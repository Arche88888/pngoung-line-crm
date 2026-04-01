FROM node:20-slim AS base
WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/

# Install all dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/
COPY tsconfig.base.json ./

# Build shared package first
RUN npm run build --workspace @pngoung/shared 2>/dev/null || true

# Set API URL at build time
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build Next.js
RUN npm run build --workspace @pngoung/web

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "@pngoung/web"]

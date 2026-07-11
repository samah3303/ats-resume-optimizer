# ─── Build stage ───────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

# Prisma needs OpenSSL for its query engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies needed for Prisma and build
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client for Debian (glibc, not musl)
COPY prisma/schema.prisma ./prisma/
RUN echo "platform: glibc" && npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# ─── Production stage ──────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app

# Prisma needs OpenSSL for its query engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone Next.js output
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema + generated client for db push on startup
COPY --from=builder /app/prisma/schema.prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy entrypoint
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]

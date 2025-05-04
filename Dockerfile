FROM node:22.14.0-slim
RUN apt update && \
    apt upgrade -y && \
    apt install -y openssl postgresql-client curl && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g corepack@latest
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
COPY prisma ./prisma
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

COPY . .

ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "./scripts/healthcheck.sh && pnpm db:deploy && pnpm start"]
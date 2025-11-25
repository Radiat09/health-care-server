FROM oven/bun:1-alpine

WORKDIR /app

# Install OpenSSL - this fixes the Prisma issue
RUN apk add --no-cache openssl

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bunx prisma generate

EXPOSE 5000

# Setup database and start (with error handling)
CMD ["sh", "-c", "bunx prisma db push && bun run dev"]
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy everything
COPY . .

# Debug: List files to verify .env is copied
RUN ls -la


EXPOSE 5000

# Generate Prisma client and start server
CMD bunx prisma generate && bun run dev
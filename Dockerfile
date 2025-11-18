FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy everything
COPY . .

# Generate Prisma client
RUN bunx prisma generate

EXPOSE 5000

# Create database, run migrations, then start server
CMD sh -c "bunx prisma db push && bun run dev"
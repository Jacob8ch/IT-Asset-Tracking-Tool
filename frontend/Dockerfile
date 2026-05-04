FROM node:24-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:24-slim

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/build ./build

# Copy public folder
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]

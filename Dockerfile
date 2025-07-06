# Build stage
FROM node:20.16.0-slim AS builder

# Metadata
LABEL org.opencontainers.image.source https://github.com/kaiz16/stackfolio-node-mvc-starter

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy all except ignored files in .dockerignore
COPY . .

# Build and prune production dependencies
RUN npm run build && npm prune --production

# Production stage (use node:20.16.0-slim if you're gonna use puppeteer)
FROM node:20.16.0-slim AS production 

# Set working directory in container
WORKDIR /app

# Copy dist folder, public folder, node_modules folder, and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE $PORT

# Run start script
CMD ["npm", "run", "start"]